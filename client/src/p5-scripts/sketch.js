import SpeechBubble from "./speech-bubble";
import data from "../data/audio-data.json";
import { processData } from "../data/data-processor";

let sketch = (p) => {
  //   window.p5 = p;
  //   console.log(window.p5);

  let x = 100;
  let y = 100;
  const speechBubbles = [];

  p.setup = function () {
    p.createCanvas(600, 600);
    p.background(0);

    const initialData = data[0];
    const speechBubble = new SpeechBubble({ p, ...initialData });
    speechBubbles.push(speechBubble);

    processData();
  };

  p.draw = function () {
    p.clear();
    p.background(0);
    p.blendMode(p.ADD);

    p.fill(255);
    p.textSize(32);
    p.text(p.round(p.frameRate()), 10, 30);

    speechBubbles.forEach((speechBubble) => {
      speechBubble.draw(p);
    });
  };
};

export default sketch;
