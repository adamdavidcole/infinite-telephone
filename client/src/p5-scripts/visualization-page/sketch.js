import { getOrderedIds } from "../../data/data-processor";
import { processData } from "../../data/data-processor";
import WordStrip from "./word-strip";
import SceneManager from "./scene-manager";
import AudioManager from "./audio-manager";
import AudioRing from "../record-page/audio-ring";
import Camera from "../poster/camera";
import { SHOULD_ANIMATE } from "../../utilities/constants";

const SAVE_PHOTO = false; // prod = false
const SHOULD_PLAY_AUDIO = true; // prod = true
const SHOW_AUDIO_RING = false; // prod = false
const SHOULD_RECORD = true;

const WIDTH_PER_STRIP = 300;

const instagramWidth = 600;

let canvas;
let camera;
const FPS = 60;
const DURATION = 33000;

let wordStrips = [];
const wordStripMap = {};

let sceneManager;
let audioManager;

let audioRing;

let sketch = (p, { audioData, useTestAudio }) => {
  p.setup = function () {
    processData(audioData);
    const sortedIds = getOrderedIds();
    const visibleBubbleCount = sortedIds.length;

    if (SAVE_PHOTO) p.pixelDensity(4);
    if (SHOULD_ANIMATE) {
      canvas = p.createCanvas(instagramWidth, instagramWidth);
    } else {
      canvas = p.createCanvas(
        WIDTH_PER_STRIP * visibleBubbleCount,
        p.windowHeight
      );
    }
    // p.background(0, 0, 30);

    camera = new Camera(FPS, DURATION, p);
    camera.setup();

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

    if (SHOULD_PLAY_AUDIO) {
      audioManager = new AudioManager({ useTestAudio });
    }

    if (SHOULD_ANIMATE) {
      sceneManager = new SceneManager({ wordStrips, audioManager });
    } else {
      wordStrips.forEach((wordStrip) => {
        wordStrip.initialize();
        wordStrip.endAnimation();
      });
    }

    if (SHOW_AUDIO_RING) {
      const audioRingPosition = p.createVector(p.width / 2, 200);
      audioRing = new AudioRing({
        p,
        maxRadius: 300,
        position: audioRingPosition,
      });
    }
  };

  p.draw = function () {
    sceneManager?.update();

    p.clear();
    p.background(17, 17, 17 * 1.5);
    p.blendMode(p.ADD);

    p.noStroke();
    p.fill(255);
    p.textSize(32);
    // p.text(p.round(p.frameRate()), 10, 30);

    wordStrips.forEach((wordStrip) => {
      wordStrip.draw(p);
    });

    audioRing?.draw(p);

    if (SHOULD_RECORD) {
      camera.record();
    }

    if (SAVE_PHOTO) {
      p.noLoop();
      p.save(`audio-visualization-${Date.now()}.png`);
    }
  };

  p.mouseClicked = () => {
    // console.log("Save image");
    // p.save(canvas, "sketch-if.png");
  };
};

export default sketch;
