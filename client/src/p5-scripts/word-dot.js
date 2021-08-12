export default class WordDot {
  constructor({ x, y, p, count, word }) {
    this.word = word;
    this.count = count;

    this.position = p.createVector(x, y);

    this.width = 4;
    this.height = Math.max(this.width * (this.count / 2), this.width);
    // this.height = this.width;
    this.borderRadius = 2;
  }

  update() {
    this.position.x = this.position.x - Math.random();
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
