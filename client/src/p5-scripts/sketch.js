import SpeechBubble from "./speech-bubble";
import data from "../data/audio-data.json";

let sketch = (p5) => {
  let x = 100;
  let y = 100;
  const speechBubbles = [];

  p5.setup = function () {
    p5.createCanvas(600, 600);

    const initialData = data[0];
    const speechBubble = new SpeechBubble({ p5, ...initialData });
    speechBubbles.push(speechBubble);
  };

  p5.draw = function () {
    p5.background(0);
    speechBubbles.forEach((speechBubble) => {
      speechBubble.draw(p5);
    });
  };
};

export default sketch;
