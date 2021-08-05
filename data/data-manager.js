import { Low, JSONFile } from "lowdb";
import path, { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import _ from "lodash";

import getTranscriptForFile from "../speech-to-text.js";

const __dirname = path.resolve();

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

  processDataEntry(dataEntry);
}

/**
 *    input - string, path of input file
 *    output - string, path of output file
 *    callback - function, node-style callback fn (error, result)
 */
function convert(input, output, callback) {
  ffmpeg(input)
    .output(output)
    .on("end", function () {
      console.log("conversion ended");
      callback(null);
    })
    .on("error", function (err) {
      console.log("err", err);
      console.log("error: ", err.code, err.msg);
      callback(err);
    })
    .run();
}

async function handleTranscriptForDataEntry({ dataEntry, transcript }) {
  const { timestamp } = dataEntry;
  console.log(
    "Saving transcript for dataEntry: ",
    timestamp,
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
  };

  data[existingDataEntryIndex] = nextDataEntry;
  await db.write();

  console.log("DB update for dataEntry", timestamp);
}

function processDataEntry(dataEntry) {
  const { filename } = dataEntry;
  const mp3Filename = `${filename.split(".")[0]}.mp3`;

  if (filename !== mp3Filename) {
    convert(`./files/${filename}`, `./files/${mp3Filename}`, (err) => {
      if (!err) {
        console.log("conversion complete");
        getTranscriptForFile(mp3Filename).then((transcript) => {
          handleTranscriptForDataEntry({ dataEntry, transcript });
        });
      }
    });
  } else {
    getTranscriptForFile(mp3Filename).then((transcript) => {
      handleTranscriptForDataEntry({ dataEntry, transcript });
    });
  }
}
