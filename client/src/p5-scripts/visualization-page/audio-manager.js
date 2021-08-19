import { getAudioFilenameById } from "../../data/data-processor.js";

const TEST_AUDIO_URL_PATH_PREFIX = "/media/audio/";
const AUDIO_URL_PATH_PREFIX = "/";
const AUDIO_FADE_RATE = 0.001;

export default class AudioManager {
  constructor({ useTestAudio }) {
    this.audioUrlPath = useTestAudio
      ? TEST_AUDIO_URL_PATH_PREFIX
      : AUDIO_URL_PATH_PREFIX;
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
      audioObj.volume = 1;
      audioObj.play();

      //   const interval = setInterval(() => {
      //     if (audioObj.volume >= 1 - AUDIO_FADE_RATE) {
      //       clearInterval(interval);
      //       return;
      //     }

      //     audioObj.volume += AUDIO_FADE_RATE;
      //   }, 10);
    });

    this.audioObjs[id] = audioObj;
  }

  beginAudioFadeOut(id) {
    const audioObj = this.audioObjs[id];
    if (!audioObj) return;

    audioObj.volume = 0;

    // const interval = setInterval(() => {
    //   if (audioObj.volume <= AUDIO_FADE_RATE) {
    //     clearInterval(interval);
    //     return;
    //   }

    //   audioObj.volume -= AUDIO_FADE_RATE;
    // }, 10);
  }
}
