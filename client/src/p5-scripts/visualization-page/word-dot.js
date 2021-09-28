import { Vector } from "p5";
import { MAX_ANIMATION_DURATION } from "./scene-manager";
import getWordColor from "../../utilities/get-word-color";
import hslToRgb from "../../utilities/hsl-to-rgb";

import ANIMATION_STATUS from "../../utilities/animation-status";

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;

const TOTAL_HORIZONTAL_DISTANCE = 500;
const FRAME_RATE_PER_SECOND = 55;
export default class WordDot {
  constructor({ x, y, p, count, word, index, totalWords }) {
    this.word = word;
    this.count = count;
    this.p = p;

    this.index = index;
    this.totalWords = totalWords;

    this.position = p.createVector(x, y);
    this.currPosition = p.createVector(x, -1);

    // particle properties
    this.velocity = p.createVector(-1, -1);
    this.acceleration = p.createVector(0, 0);
    this.maxspeed = 10;
    this.maxforce = 4;

    this.animationStatus = BEFORE_ANIMATION;
    this.animationStartTime = 0;
    this.animationDuration = 250;
    this.horizontalDistance =
      TOTAL_HORIZONTAL_DISTANCE - (p.width - this.position.x);

    this.width = 4;
    this.height = Math.max(this.width * (this.count / 2), this.width);
    // this.height = this.width;
    this.borderRadius = 2;
  }

  setAnimationDuration(animationDuration) {
    // console.log("setting animation duration", animationDuration);
    this.animationDuration = animationDuration;
    // console.log("this.animationDuration", this.animationDuration);
  }

  getHorizonatalShiftPerFrame() {
    const pixelsPerMillis = this.horizontalDistance / this.animationDuration;
    // console.log(
    //   "pixelsPerMillis",
    //   pixelsPerMillis,
    //   "this.animationDuration",
    //   this.animationDuration
    // );
    const framesPerMillis = FRAME_RATE_PER_SECOND / 1000;
    const millisPerFrame = 1 / framesPerMillis;
    // console.log(
    //   "millisPerFrame",
    //   millisPerFrame,
    //   "this.p.frameRate",
    //   this.p.frameRate()
    // );
    const pixelsPerFrame = pixelsPerMillis * millisPerFrame;
    if (pixelsPerFrame <= 0 || pixelsPerFrame > 1000) return 0;
    return pixelsPerFrame;
  }

  startAnimation() {
    this.animationStatus = ANIMATING;
    this.currPosition.x = this.position.x + this.p.random(-10, 10);
    this.currPosition.y = this.p.height + 1;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    const xJitter = this.p.map(Math.random(), 0, 1, -0.25, 0.25);
    this.position.x = this.position.x - Math.random() * 1.35 + xJitter;
    this.position.y = this.position.y + (Math.random() - 0.5) / 10;

    if (this.animationStatus === ANIMATING) {
      // const target = mouseX && mouseY && this.p.createVector(mouseX, mouseY);
      // const target = this.p.createVector(0, 0);
      let desired = Vector.sub(this.position, this.currPosition);
      let d = desired.mag();

      // if (d < 3) {
      //   this.currPosition = this.position;
      //   return;
      // }

      if (d < 100) {
        let m = this.p.map(d, 0, 100, 0, this.maxspeed);
        desired.setMag(m);
      } else {
        desired.setMag(this.maxspeed);
      }

      let steer = Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);

      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxspeed);
      this.currPosition.add(this.velocity);
      this.acceleration.mult(0);
    }
  }

  draw(p) {
    if (this.animationStatus === BEFORE_ANIMATION) {
      this.startAnimation();
    }
    // const { r, g, b } = getWordColor(this.word);

    const hue = p.map(this.index, 0, this.totalWords, 0, 50);
    const [r, g, b] = hslToRgb(hue / 360, 1, 0.8);

    p.noStroke();
    p.fill(225);
    // p.fill(r, g, b);

    // p.textSize(4);
    // p.text(this.word, this.position.x, this.position.y - this.height);

    // p.rect(
    //   this.position.x,
    //   this.position.y - this.height,
    //   this.width,
    //   this.height,
    //   this.borderRadius
    // );

    p.rect(
      this.currPosition.x,
      this.currPosition.y - this.height,
      this.width,
      this.height,
      this.borderRadius
    );
  }
}
