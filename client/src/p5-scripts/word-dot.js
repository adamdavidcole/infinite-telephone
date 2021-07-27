export default class WordDot {
  constructor({ x, y, p, count, word }) {
    this.word = word;
    this.count = count;

    this.position = p.createVector(x, y);

    this.width = 2;
    this.height = 2 * this.count;
    this.borderRadius = 2;
  }

  draw(p) {
    p.noStroke();
    p.fill(255);

    p.rect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.borderRadius
    );
  }
}
