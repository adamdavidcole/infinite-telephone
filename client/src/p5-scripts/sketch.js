import SpeechBubble from "./speech-bubble";
import data from "../data/audio-data.json";
import { getOrderedIds } from "../data/data-processor";
import { processData } from "../data/data-processor";

window.modes = {
  LINEAR: "linear",
  RADIAL: "radial",
};
window.MODE = window.modes.LINEAR;

let sketch = (p) => {
  //   window.p5 = p;
  //   console.log(window.p5);

  let x = 100;
  let y = 100;
  const speechBubbles = [];
  const speechBubbleMap = {};

  p.setup = function () {
    if (window.MODE === window.modes.LINEAR) {
      p.createCanvas(1200, 300);
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

    // const id = sortedIds[0];
    // const speechBubble = new SpeechBubble({
    //     p,
    //     id,
    //     index: 0,
    //     visibleBubbleCount,
    //   });
    //   speechBubbles.push(speechBubble);

    sortedIds.forEach((id, index) => {
      const speechBubble = new SpeechBubble({
        p,
        id,
        index,
        visibleBubbleCount,
        speechBubbleMap,
      });
      speechBubbles.push(speechBubble);
      speechBubbleMap[id] = speechBubble;
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
  };
};

export default sketch;
