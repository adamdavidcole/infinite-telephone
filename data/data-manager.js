import { Low, JSONFile } from "lowdb";
import path, { join } from "path";
import ffmpeg from "fluent-ffmpeg";

const __dirname = path.resolve();

const file = join(__dirname, "data/db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, this will set db.data content
export async function initialize() {
  await db.read();
}

export function getData() {
  return db.data;
}

export async function addDataEntry(dataEntry) {
  db.data.push(dataEntry);
  console.log("db.data update", db.data);
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

function processDataEntry(dataEntry) {
  const { filename } = dataEntry;
  const mp3Filename = `${filename.split(".")[0]}.mp3`;

  if (filename !== mp3Filename) {
    convert(`./files/${filename}`, `./files/${mp3Filename}`, (err) => {
      if (!err) {
        console.log("conversion complete");
        //...
      }
    });
  }
}
