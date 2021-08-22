import { MAX_ANIMATION_DURATION } from "./scene-manager";
export default class WordDot {
  constructor({ x, y, p, count, word }) {
    this.word = word;
    this.count = count;

    this.position = p.createVector(x, y);

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

  update() {
    this.position.x = this.position.x - Math.random() * 1.125;
    this.position.y = this.position.y + (Math.random() - 0.5) / 10;
  }

  draw(p) {
    p.noStroke();
    p.fill(100);

    p.rect(
      this.position.x,
      this.position.y - this.height,
      this.width,
      this.height,
      this.borderRadius
    );
  }
}
