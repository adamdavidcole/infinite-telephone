import { Vector } from "p5";
import Particle from "./particle";
import Spring from "./spring";

const PARTCILES_PER_STRING = 10;
const k = 1;

export default class Wire {
  constructor({ start, end, word, weight, p }) {
    this.start = start;
    this.end = end;
    this.length = Vector.sub(this.end, this.start).mag();

    this.word = word;
    this.weight = weight;

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

  update() {
    this.particles.forEach((particle) => {
      particle.update();
    });

    this.springs.forEach((spring) => {
      spring.update();
    });
  }

  draw(p) {
    const r = p.pow(this.word.charCodeAt(0), 2) % 255;
    const g = 60;
    const b = p.pow(this.word.charCodeAt(1), 1) % 255;
    // p.fill(r, 50, b);
    p.strokeWeight(this.weight);

    const stroke = p.map(this.weight, 1, 5, 100, 200);
    p.stroke(r, g, b, stroke);

    p.noFill();
    if (this.word === "family")
      console.log("r", r, "g", g, "b", b, "a", stroke);

    // p.line(0, 0, p.random(500), p.random(500));

    p.beginShape();
    p.curveVertex(this.head.position.x, this.head.position.y);
    this.particles.forEach((particle) => {
      p.curveVertex(particle.position.x, particle.position.y);
    });
    p.curveVertex(this.tail.position.x, this.tail.position.y);
    p.endShape();
  }
}
