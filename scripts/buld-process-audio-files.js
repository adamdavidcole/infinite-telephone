import fs from "fs";
import processAudio from "../data/audio-processing.js";

const directory = process.argv[2];
console.log("Process files in: ", directory);

fs.readdir(directory, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    const inputFilename = `${directory}/${file}`;
    processAudio({ inputFilename });
  });
});
