export default class Link {
  constructor({ p5, start, end }) {
    this.start = start;
    this.end = end;
  }

  draw(p5) {
    p5.fill(255);
    p5.strokeWeight(1);
    p5.stroke(255, 10);
    p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
  }
}
