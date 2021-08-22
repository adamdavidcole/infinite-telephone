import { getOrderedIds } from "../../data/data-processor";
import { processData } from "../../data/data-processor";
import WordStrip from "./word-strip";
import SceneManager from "./scene-manager";
import AudioManager from "./audio-manager";

const SAVE_PHOTO = false;

let wordStrips = [];
const wordStripMap = {};

let sceneManager;
let audioManager;

let sketch = (p, { audioData, useTestAudio }) => {
  p.setup = function () {
    if (SAVE_PHOTO) p.pixelDensity(4);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0);

    processData(audioData);

    const sortedIds = getOrderedIds();
    const visibleBubbleCount = sortedIds.length;

    sortedIds.forEach((id, index) => {
      const wordStrip = new WordStrip({
        p,
        id,
        index,
        visibleBubbleCount,
        wordStripMap,
      });
      wordStrips.push(wordStrip);
      wordStripMap[id] = wordStrip;
    });

    audioManager = new AudioManager({ useTestAudio });
    sceneManager = new SceneManager({ wordStrips, audioManager });
  };

  p.draw = function () {
    sceneManager.update();

    p.clear();
    p.background(0);
    p.blendMode(p.ADD);

    p.noStroke();
    p.fill(255);
    p.textSize(32);
    // p.text(p.round(p.frameRate()), 10, 30);

    wordStrips.forEach((wordStrip) => {
      wordStrip.draw(p);
    });

    if (SAVE_PHOTO) {
      p.noLoop();
      p.save(`audio-visualization-${Date.now()}.png`);
    }
  };
};

export default sketch;
