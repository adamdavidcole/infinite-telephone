import hslToRgb from "./hsl-to-rgb";

const wordColors = {};

const HUE_INCREMENT = 2;

let currHue = 200;
const HUE_MIN = 200;
const HUE_MAX = 330;

export default function getWordColor(word) {
  if (!word) return { r: 100, g: 100, b: 100 };

  if (wordColors[word]) return wordColors[word];

  const [r, g, b] = hslToRgb(currHue / 360, 0.5, 0.5);
  wordColors[word] = { r, b, g };

  currHue += HUE_INCREMENT;
  if (currHue >= HUE_MAX) {
    currHue = HUE_MIN;
  }

  return wordColors[word];
}
