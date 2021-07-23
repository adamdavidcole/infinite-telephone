import SpeechBubble from "./speech-bubble";
import data from "../data/audio-data.json";
import { getOrderedIds } from "../data/data-processor";
import { processData } from "../data/data-processor";
import Path from "./path";
import WordBall from "./word-ball";

window.modes = {
  LINEAR: "linear",
  RADIAL: "radial",
};
window.MODE = window.modes.LINEAR;

let path;
let wordBalls = [];
const wordBallCount = 20;

let sketch = (p) => {
  //   window.p5 = p;
  //   console.log(window.p5);

  let x = 100;
  let y = 100;
  const speechBubbles = [];
  const speechBubbleMap = {};

  p.setup = function () {
    if (window.MODE === window.modes.LINEAR) {
      p.createCanvas(p.windowWidth, p.windowWidth * (9 / 16));
    } else if (window.MODE === window.modes.RADIAL) {
      p.createCanvas(1000, 1000);
    }
    p.background(0);

    // const initialData = data[0];
    // const speechBubble = new SpeechBubble({ p, ...initialData });
    // speechBubbles.push(speechBubble);

    processData();

    const sortedIds = getOrderedIds();

    const visibleBubbleCount = sortedIds.length;

    // path = new Path();
    // const pathResolution = 20;
    // const angleStep = p.TWO_PI / pathResolution;
    // const center = p.createVector(p.width / 2, p.height / 2);
    // for (let angle = 0; angle < p.TWO_PI; angle += angleStep) {
    //   const radius = 300;
    //   const pointX = radius * p.sin(angle) + center.x;
    //   const pointY = radius * p.cos(angle) + center.y;
    //   const point = p.createVector(pointX, pointY);
    //   path.addPoint(point);
    // }

    // for (let i = 0; i < wordBallCount; i++) {
    //   const wordBall = new WordBall({
    //     p,
    //     word: `${i}`,
    //     count: 3,
    //     containerCenter: center,
    //     containerSize: 300,
    //     path,
    //   });
    //   wordBalls.push(wordBall);
    // }

    // const id = sortedIds[2];
    // const speechBubble = new SpeechBubble({
    //   p,
    //   id,
    //   index: 2,
    //   visibleBubbleCount,
    //   speechBubbleMap,
    //   displayAudioBubble: id === 2,
    // });
    // speechBubbles.push(speechBubble);
    // speechBubbleMap[id] = speechBubble;

    sortedIds.forEach((id, index) => {
      const speechBubble = new SpeechBubble({
        p,
        id,
        index,
        visibleBubbleCount,
        speechBubbleMap,
        displayAudioBubble: false,
      });
      speechBubbles.push(speechBubble);
      speechBubbleMap[id] = speechBubble;
    });

    speechBubbles.forEach((speechBubble) => {
      speechBubble.initialize(p);
    });
  };

  p.draw = function () {
    p.clear();
    p.background(0);
    p.blendMode(p.ADD);

    p.noStroke();
    p.fill(255);
    p.textSize(32);
    p.text(p.round(p.frameRate()), 10, 30);

    speechBubbles.forEach((speechBubble) => {
      speechBubble.draw(p);
    });

    wordBalls.forEach((wordBall) => {
      wordBall.behaviors({ p, wordBalls });
      wordBall.update(p);
    });

    // path.draw(p);
    // wordBalls.forEach((wordBall) => {
    //   wordBall.draw(p);
    // });
  };
};

export default sketch;
