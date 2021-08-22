import { getAudioFilenameById } from "../../data/data-processor.js";

const AUDIO_URL_PATH_PREFIX =
  "https://infinite-telephone.s3.us-east-2.amazonaws.com/";
const AUDIO_FADE_OUT_RATE = 0.00025;
const AUDIO_FADE_IN_RATE = 0.005;

export default class AudioManager {
  constructor({ useTestAudio }) {
    this.audioUrlPath = AUDIO_URL_PATH_PREFIX;
    this.audioObjs = {};
  }

  beginAudioById(id) {
    const filename = getAudioFilenameById(id);
    console.log("beginAudioById", id, "filename", filename);

    if (!filename) return;

    console.log("AudioManager: playAudio for: ", filename);

    const audioObj = new Audio(`${this.audioUrlPath}${filename}`);
    audioObj.preload = true;
    audioObj.addEventListener("canplaythrough", (event) => {
      audioObj.volume = 0;
      audioObj.play();

      const interval = setInterval(() => {
        if (audioObj.volume >= 1 - AUDIO_FADE_IN_RATE) {
          clearInterval(interval);
          audioObj.volume = 1;
          return;
        }

        audioObj.volume += AUDIO_FADE_IN_RATE;
      }, 10);
    });

    this.audioObjs[id] = audioObj;
  }

  beginAudioFadeOut(id) {
    console.log("");
    const audioObj = this.audioObjs[id];
    if (!audioObj) return;

    audioObj.volume = 0.5;

    const interval = setInterval(() => {
      if (audioObj.volume <= AUDIO_FADE_OUT_RATE) {
        clearInterval(interval);
        audioObj.volume = 0;
        delete this.audioObjs[id];
        return;
      }

      audioObj.volume -= AUDIO_FADE_OUT_RATE;
    }, 10);
  }
}
