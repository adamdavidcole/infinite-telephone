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

function convertToMp3({ inputFilename }) {
  const filenameWithoutExt = removeExtension(inputFilename);
  const outputFilename = `${filenameWithoutExt}-converted.mp3`;

  console.log("converting: ", inputFilename, "; to: ", outputFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilename)
      .audioFilters([
        { filter: "highpass", options: "f=200" },
        { filter: "lowpass", options: "f=3000" },
        { filter: "silenceremove", options: `1:0:-35dB` },
      ])
      .on("end", function () {
        console.log("conversion ended");
        resolve(outputFilename);
      })
      .on("error", function (err) {
        console.error("convertToMp3 err", err);
        console.error("convertToMp3 error details: ", err.code, err.msg);
        reject(err);
      })
      .save(outputFilename);
  });
}

function normalizeAudio({ inputFilename, outputFilename }) {
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
        resolve(normalized);
      })
      .catch((error) => {
        // Some error happened
        console.err("Error normalizeAudio", error);
        reject(err);
      });
  });
}

export default function processAudio({ inputFilename }) {
  const extension = getExtension(inputFilename);
  const normalizedOutputFilename = `${removeExtension(
    inputFilename
  )}-normalized.${extension}`;

  return normalizeAudio({
    inputFilename,
    outputFilename: normalizedOutputFilename,
  }).then((filename) => {
    return convertToMp3({
      inputFilename: normalizedOutputFilename,
    });
  });
}
