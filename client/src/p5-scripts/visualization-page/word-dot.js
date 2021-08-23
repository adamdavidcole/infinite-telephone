import { MAX_ANIMATION_DURATION } from "./scene-manager";
import getWordColor from "../../utilities/get-word-color";
import hslToRgb from "../../utilities/hsl-to-rgb";

import ANIMATION_STATUS from "../../utilities/animation-status";

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;

export default class WordDot {
  constructor({ x, y, p, count, word, index, totalWords }) {
    this.word = word;
    this.count = count;

    this.index = index;
    this.totalWords = totalWords;

    this.position = p.createVector(x, y);
    this.currPostion = p.createVector(x, 0);

    this.animationStatus = BEFORE_ANIMATION;
    this.animationStartTime = 0;
    this.animationDuration = 250;

    const travelDistancePerAnimation = 100;
    const frameRatePerSeconds = p.frameRate();
    const animationDurationSeconds = MAX_ANIMATION_DURATION / 1000;
    const totalFramesPerAnimation =
      frameRatePerSeconds * animationDurationSeconds;

    const distancePerFrame =
      travelDistancePerAnimation / totalFramesPerAnimation;
    const maxDistancePerFrame = distancePerFrame * 4;

    this.width = 4;
    this.height = Math.max(this.width * (this.count / 2), this.width);
    // this.height = this.width;
    this.borderRadius = 2;
  }

  startAnimation({ animationStartTime, animationStatus, animationDuration }) {
    console.log("start animation for", this.index);
  }

  update() {
    this.position.x = this.position.x - Math.random() * 1.125;
    this.position.y = this.position.y + (Math.random() - 0.5) / 10;
  }

  draw(p) {
    if (this.animationStatus === BEFORE_ANIMATION) {
      this.startAnimation({});
    }
    // const { r, g, b } = getWordColor(this.word);

    const hue = p.map(this.index, 0, this.totalWords, 0, 50);
    const [r, g, b] = hslToRgb(hue / 360, 1, 0.8);

    p.noStroke();
    p.fill(225);
    // p.fill(r, g, b);

    // p.textSize(4);
    // p.text(this.word, this.position.x, this.position.y - this.height);

    p.rect(
      this.position.x,
      this.position.y - this.height,
      this.width,
      this.height,
      this.borderRadius
    );
  }
}
