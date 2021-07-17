export default class Link {
  constructor({ p, start, end, weight }) {
    this.start = start;
    this.end = end;
    this.weight = weight;
  }

  draw(p) {
    p.fill(255);
    p.strokeWeight(this.weight);
    p.stroke(255);
    p.line(this.start.x, this.start.y, this.end.x, this.end.y);
  }
}
