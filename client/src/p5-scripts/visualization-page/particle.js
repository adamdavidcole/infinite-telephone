const MAX_VELOCITY = 1.5;

export default class Particle {
  constructor(x, y, p) {
    this.locked = false;
    this.acceleration = p.createVector(0, 0);
    this.velocity = p.createVector(0, 0);
    this.position = p.createVector(x, y);
    this.mass = 1; // Let's do something better here!

    this.GRAVITY_FORCE = p.createVector(0, 3);
  }

  applyGravity() {
    this.applyForce(this.GRAVITY_FORCE);
  }

  applyForce(force) {
    let f = force.copy();
    f.div(this.mass);
    this.acceleration.add(f);
  }

  // Method to update position
  update() {
    if (!this.locked) {
      this.applyGravity();

      this.velocity.mult(0.99);
      this.velocity.add(this.acceleration);
      this.velocity.limit(MAX_VELOCITY);

      this.position.add(this.velocity);
      this.acceleration.mult(0);
    }
  }

  // Method to display
  draw(p) {
    // p.stroke(255);
    // p.strokeWeight(2);
    // p.fill(45, 197, 244);
    // p.ellipse(this.position.x, this.position.y, 16);
  }
}
