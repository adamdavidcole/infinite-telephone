import hslToRgb from "./hsl-to-rgb";

const wordColors = {};

const HUE_INCREMENT = 3;

let currHue = 215;
const HUE_MIN = 0;
const HUE_MAX = 360;

export default function getWordColor(word) {
  if (!word) return { r: 40, g: 100, b: 100 };

  if (wordColors[word]) return wordColors[word];

  const [r, g, b] = hslToRgb(currHue / 360, 0.5, 0.5);
  wordColors[word] = { r, b, g };

  currHue += HUE_INCREMENT;
  if (currHue >= HUE_MAX) {
    currHue = HUE_MIN;
  }

  return wordColors[word];
}
