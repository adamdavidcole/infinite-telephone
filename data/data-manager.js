import { Low, JSONFile } from "lowdb";
import path, { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import processAudio, {
  removeExtension,
  getFilenameFromPath,
} from "./audio-processing.js";
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

export async function addDataEntry(dataEntry) {
  const data = await getData();
  data.push(dataEntry);

  console.log("db.data update", data);
  await db.write();

  return processDataEntry(dataEntry);
}

async function handleUpdateDataEntry({
  dataEntry,
  transcript,
  processedFilename,
}) {
  const { timestamp } = dataEntry;
  console.log(
    "Saving transcript for dataEntry: ",
    timestamp,
    "; processedFilename: ",
    processedFilename,
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
    transcript,
    processedFilename,
  };

  data[existingDataEntryIndex] = nextDataEntry;
  await db.write();

  console.log("DB update for dataEntry", timestamp);

  return nextDataEntry;
}

function processDataEntry(dataEntry) {
  const { filename } = dataEntry;
  const filenameWithoutExt = removeExtension(filename);
  // const mp3Filename = `${filename.split(".")[0]}.mp3`;

  return processAudio({
    inputFilename: `./files/${filename}`,
  })
    .then((processedFilepath) => {
      const processedFilename = getFilenameFromPath(processedFilepath);

      if (SHOULD_GET_TRANSCRIPT) {
        return getTranscriptForFile(processedFilename).then((transcript) => {
          return handleUpdateDataEntry({
            dataEntry,
            transcript,
            processedFilename,
          });
        });
      } else {
        return handleUpdateDataEntry({ dataEntry, processedFilename });
      }
    })
    .catch((e) => {
      console.error("Error processing audio", e);
    });
}
