import { Vector } from "p5";
import Particle from "./particle";
import Spring from "./spring";
import ANIMATION_STATUS from "../../utilities/animation-status.js";
import getWordColor from "../../utilities/get-word-color";
import { SHOULD_ANIMATE } from "../../utilities/constants";

const PARTCILES_PER_STRING = 10;
const k = 1;

const ANIMATION_STEPS = {
  BEFORE_ANIMATION: "BEFORE_ANIMATION",
  ANIMATING: "ANIMATING",
  AFTER_ANIMATION: "AFTER_ANIMATION",
};

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;

export default class Wire {
  constructor({ start, end, word, weight, p }) {
    this.start = start;
    this.end = end;
    this.length = Vector.sub(this.end, this.start).mag();

    this.word = word;
    this.weight = weight;

    this.animationDuration = 10000;
    this.animationStatus = SHOULD_ANIMATE ? BEFORE_ANIMATION : AFTER_ANIMATION;
    this.animationSpeed = p.random(0.8, 1.2);

    this.particles = [];
    this.springs = [];

    for (let i = 0; i < PARTCILES_PER_STRING; i++) {
      const distance = (this.length / (PARTCILES_PER_STRING - 1)) * i;
      const distanceVec = Vector.sub(this.end, this.start);
      distanceVec.normalize();
      distanceVec.setMag(distance);

      const position = Vector.add(this.start, distanceVec);

      this.particles[i] = new Particle(position.x, position.y, p);

      if (i !== 0) {
        const a = this.particles[i];
        const b = this.particles[i - 1];
        const spring = new Spring(k, a, b);
        this.springs.push(spring);
      }
    }

    this.head = this.particles[0];
    this.tail = this.particles[this.particles.length - 1];

    this.head.locked = true;
    this.head.position = start;
    this.tail.locked = true;
    this.tail.position = end;
  }

  setAnimationStatus({
    animationStatus,
    animationStartTime,
    animationDuration,
  }) {
    this.animationDuration = animationDuration;
    this.animationStatus = animationStatus;
    this.animationStartTime = animationStartTime;
  }

  getAnimationProgress(p) {
    const timeElapsed = Date.now() - this.animationStartTime;
    const animationProgress =
      (timeElapsed / this.animationDuration) * this.animationSpeed;
    return p.min(animationProgress, 1);
  }

  update() {
    this.particles.forEach((particle) => {
      particle.update();
    });

    this.springs.forEach((spring) => {
      spring.update();
    });
  }

  draw(p) {
    if (this.animationStatus === BEFORE_ANIMATION) return;

    const { r, g, b } = getWordColor(this.word);

    p.strokeWeight(Math.min(this.weight * 1.25, 10));
    const stroke = p.map(this.weight, 1, 5, 200, 255);
    p.stroke(r, g, b, stroke);
    p.noFill();

    const animationProgress = this.getAnimationProgress(p);

    p.beginShape();
    let startPosition = this.head.position;

    const scaleY = p.map(animationProgress, 0, 1, -0.5, 1);

    p.push();
    p.translate(startPosition.x, startPosition.y);
    p.scale(animationProgress, scaleY);
    p.curveVertex(0, 0);

    this.particles.forEach((particle) => {
      const position = particle.position.copy().sub(startPosition);
      p.curveVertex(position.x, position.y);
    });

    let tailPosition = this.particles[this.particles.length - 1].position
      .copy()
      .sub(startPosition);
    p.curveVertex(tailPosition.x, tailPosition.y);
    p.endShape();
    p.pop();

    // p.beginShape();
    // p.curveVertex(this.head.position.x, this.head.position.y);
    // this.particles.forEach((particle) => {
    //   p.curveVertex(particle.position.x, particle.position.y);
    // });
    // p.curveVertex(this.tail.position.x, this.tail.position.y);
    // p.endShape();
  }
}
