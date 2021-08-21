import ffmpeg from "fluent-ffmpeg";
import normalize from "ffmpeg-normalize";

import _ from "lodash";

function getExtension(filepath) {
  const splitFilepath = filepath.split(".");
  return _.last(splitFilepath);
}

export function removeExtension(filepath) {
  const splitFilepath = filepath.split(".");
  return _.dropRight(splitFilepath, 1).join(".");
}

export function getFilenameFromPath(filepath) {
  return _.last(filepath.split("/"));
}

function getFileDetails(pathToFile) {
  console.log("getFileDetails", pathToFile);
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(pathToFile, function (err, metadata) {
      if (err) {
        console.error("getDuration error: ", err);
        reject(err);
      }

      const duration = parseFloat(metadata?.format?.duration) * 1000;
      resolve({ processedFilepath: pathToFile, duration });
    });
  });
}

function convertToMp3({ inputFilename }) {
  const filenameWithoutExt = removeExtension(inputFilename);
  const outputFilename = `${filenameWithoutExt}-c.mp3`;

  console.log("converting: ", inputFilename, "; to: ", outputFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilename)
      //   .audioFilters([
      //     { filter: "highpass", options: "f=200" },
      //     { filter: "lowpass", options: "f=3000" },
      //     { filter: "silenceremove", options: `1:0:-35dB` },
      //   ])
      .on("end", function () {
        console.log("conversion ended: ", outputFilename);
        resolve(outputFilename);
      })
      .on("error", function (err) {
        console.error("convertToMp3 err", err);
        reject(err);
      })
      .save(outputFilename);
  });
}

function normalizeAudio({ inputFilename }) {
  const extension = getExtension(inputFilename);
  const outputFilename = `${removeExtension(inputFilename)}-n.${extension}`;

  console.log("normalize audio", inputFilename, outputFilename);

  return new Promise((resolve, reject) => {
    normalize({
      input: inputFilename,
      output: outputFilename,
      loudness: {
        normalization: "ebuR128",
        target: {
          input_i: -23,
          input_lra: 7.0,
          input_tp: -2.0,
        },
      },
      verbose: false,
    })
      .then((normalized) => {
        // Normalized
        console.log("normalization successful:", outputFilename);
        resolve(outputFilename);
      })
      .catch((error) => {
        // Some error happened
        console.error("Error normalizeAudio", error);
        reject(error);
      });
  });
}

function applyAudioFilters({ inputFilename }) {
  const extension = getExtension(inputFilename);
  const outputFilename = `${removeExtension(inputFilename)}-f.${extension}`;

  console.log("audio filters for ", inputFilename, outputFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilename)
      .audioFilters([
        { filter: "highpass", options: "f=200" },
        { filter: "lowpass", options: "f=3000" },
        { filter: "silenceremove", options: `1:0:-35dB` },
      ])
      .on("end", function () {
        console.log("audo filters ended: ", outputFilename);
        resolve(outputFilename);
      })
      .on("error", function (err) {
        console.error("applyAudioFilters err", err);
        reject(err);
      })
      .save(outputFilename);
  });
}

export default function processAudio({ inputFilename }) {
  const extension = getExtension(inputFilename);
  const normalizedOutputFilename = `${removeExtension(
    inputFilename
  )}-n.${extension}`;

  return convertToMp3({ inputFilename })
    .then((convertedFilename) => {
      return normalizeAudio({ inputFilename: convertedFilename });
    })
    .then((normalizedFilename) => {
      return applyAudioFilters({ inputFilename: normalizedFilename });
    })
    .then((normalizedFilename) => {
      return getFileDetails(normalizedFilename);
    });
}
