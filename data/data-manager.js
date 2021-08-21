import { Low, JSONFile } from "lowdb";
import path, { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import processAudio, {
  removeExtension,
  getFilenameFromPath,
} from "./audio-processing.js";
import { uploadFileToS3 } from "./storage.js";
import _ from "lodash";

import getTranscriptForFile from "../speech-to-text.js";

const __dirname = path.resolve();

const SHOULD_GET_TRANSCRIPT = true;

const file = join(__dirname, "data/db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

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

async function handleUpdateDataEntry({
  dataEntry,
  transcript,
  processedFilename,
  duration,
}) {
  const { timestamp } = dataEntry;
  console.log(
    "Saving transcript for dataEntry: ",
    timestamp,
    "; processedFilename: ",
    processedFilename,
    "; duration",
    duration,
    "; transcript:",
    transcript
  );

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

  console.log("DB update for dataEntry", timestamp);

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
