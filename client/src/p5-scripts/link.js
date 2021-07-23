import { Vector } from "p5";

const offsetIncrement = 0.01;
export default class Link {
  constructor({ p, start, end, weight, word }) {
    this.start = start;
    this.end = end;
    this.weight = weight;
    this.word = word;

    // this.offsetY = p.random(-50, 50);
    this.xOff = p.random(100000);
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
    // p.stroke(110, 100, 0);
    // p.strokeWeight(3);

    const midPoint = Vector.add(this.start, this.end).div(2);
    const offsetJitter = p.map(p.sin(this.xOff), -1, 1, -25, 25);
    this.offsetY = offsetJitter;

    p.beginShape();
    // for (int i = 0; i < num; i++) {
    p.curveVertex(this.start.x, this.start.y);
    p.curveVertex(this.start.x, this.start.y);
    p.curveVertex(midPoint.x, midPoint.y + this.offsetY);
    p.curveVertex(this.end.x, this.end.y);
    p.curveVertex(this.end.x, this.end.y);
    // }
    p.endShape();
    // p.line(this.start.x, this.start.y, this.end.x, this.end.y);

    this.xOff = this.xOff + offsetIncrement;
  }
}
