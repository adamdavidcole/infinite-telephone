import { Low, JSONFile } from "lowdb";
import path, { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import processAudio, {
  removeExtension,
  getFilenameFromPath,
} from "./audio-processing.js";
import { uploadFileToS3, backupDB, clearDB } from "./storage.js";
import _ from "lodash";

import getTranscriptForFile from "../speech-to-text.js";

const __dirname = path.resolve();

const SHOULD_GET_TRANSCRIPT = true;
const MIN_ENTRY_DURATION = 5000;

const file = join(__dirname, "data/db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

function isCompleteDataEntry(dataEntry) {
  const { id, processedFilename, transcript, duration } = dataEntry || {};
  if (
    _.isUndefined(id) ||
    _.isUndefined(processedFilename) ||
    _.isUndefined(transcript) ||
    _.isUndefined(duration)
  ) {
    // console.log("isCompleteDataEntry invalid: undefined params", dataEntry);
    return false;
  }

  if (duration < MIN_ENTRY_DURATION) {
    // console.log("isCompleteDataEntry invalid: duration too short", duration);
    return false;
  }

  return true;
}

// Read data from JSON file, this will set db.data content
export async function initialize() {
  await db.read();
}

export async function getData() {
  await db.read();
  return db.data;
}

export async function addAndProcessDataEntry(dataEntry) {
  const data = await getData();
  data.push(dataEntry);

  await db.write();

  return processDataEntry(dataEntry);
}

export async function deleteDataEntry(id) {
  console.log("deleteEntry", id);
  const data = await getData();
  if (!data || !data.length) return;

  const dataEntryToDeleteIndex = _.findIndex(
    data,
    (dataEntry) => dataEntry.id === id
  );
  data.splice(dataEntryToDeleteIndex, 1);

  await db.write();
  backupDB();

  return data;
}

export async function resetData() {
  const data = await getData();
  if (!data || !data.length) return;

  data.splice(0, data.length);
  await db.write();

  clearDB();

  return data;
}

export async function setData(newData) {
  if (!newData || !newData.length) return;

  const data = await getData();
  data.splice(0, data.length);

  newData.forEach((dataEntry) => {
    data.push(dataEntry);
  });

  await db.write();
  backupDB();

  return data;
}

async function handleUpdateDataEntry({
  dataEntry,
  transcript,
  processedFilename,
  duration,
}) {
  const { timestamp } = dataEntry;

  const data = await getData();

  const existingDataEntryIndex = _.findIndex(
    data,
    (entry) => entry.timestamp === timestamp
  );
  if (_.isUndefined(existingDataEntryIndex)) {
    console.error("Cannot find data entry for ", timestamp);
    return;
  }

  const existingDataEntry = data[existingDataEntryIndex];
  const nextDataEntry = {
    ...existingDataEntry,
  };
  if (transcript) nextDataEntry.transcript = transcript;
  if (processedFilename) nextDataEntry.processedFilename = processedFilename;
  if (duration) nextDataEntry.duration = duration;

  data[existingDataEntryIndex] = nextDataEntry;

  await db.write();

  if (isCompleteDataEntry(nextDataEntry)) {
    // backup to storage DB for complete valid entry updates
    backupDB();
  }

  return nextDataEntry;
}

export function processTranscriptForDataEntry(dataEntry) {
  if (!SHOULD_GET_TRANSCRIPT) return Promise.resolve();

  const { processedFilename } = dataEntry || {};
  if (!processedFilename) {
    console.warn(
      "processTranscriptForDataEntry: no processedFilename on data entry"
    );
    return;
  }

  return getTranscriptForFile(processedFilename).then((transcript) => {
    return handleUpdateDataEntry({ dataEntry, transcript });
  });
}

function processDataEntry(dataEntry) {
  const { filename } = dataEntry;
  // const mp3Filename = `${filename.split(".")[0]}.mp3`;

  return processAudio({
    inputFilename: `./files/${filename}`,
  })
    .then(({ processedFilepath, duration }) => {
      console.log("processAudio final step");
      const processedFilename = getFilenameFromPath(processedFilepath);

      uploadFileToS3({
        filepath: processedFilepath,
        filename: processedFilename,
      }).catch((err) => {
        console.error("AWS:error uploading file to s3", err);
      });

      return handleUpdateDataEntry({
        dataEntry,
        processedFilename,
        duration,
      });
    })
    .catch((e) => {
      console.error("Error processing audio", e);
    });
}
