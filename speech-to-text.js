import fs from "fs";
import _ from "lodash";
import SpeechToTextV1 from "ibm-watson/speech-to-text/v1.js";
import { IamAuthenticator } from "ibm-watson/auth/index.js";

const CONTENT_TYPES = {
  mp3: "audio/mpeg",
  webm: "audio/webm",
  ogg: "audio/ogg",
};

let speechToText;

function initialize() {
  speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: process.env.IBM_ABI_KEY,
    }),
    serviceUrl: process.env.IBM_SERVICE_URL,
  });
}

function callSpeechToTextAPI(filename) {
  if (!speechToText) initialize();

  const fileExtension = _.last(filename?.split("."));
  const contentType = CONTENT_TYPES[fileExtension];

  const recognizeParams = {
    audio: fs.createReadStream(`./files/${filename}`),
    contentType,
    maxAlternatives: 1,
    interimResults: false,
  };

  return speechToText
    .recognize(recognizeParams)
    .then((speechRecognitionResults) => {
      console.log(JSON.stringify(speechRecognitionResults, null, 2));
      const { results } = speechRecognitionResults.result;

      let transcript = "";
      results.forEach((result) => {
        const transcriptPart = result.alternatives[0].transcript;
        transcript += " " + transcriptPart;
      });
      console.log("transcript", transcript);
      return transcript;
    })
    .catch((err) => {
      console.log("error:", err);
    });
}

export default function getTranscriptForFile(filename) {
  console.log(`getting transcript for ${filename}`);
  return callSpeechToTextAPI(filename);
}
