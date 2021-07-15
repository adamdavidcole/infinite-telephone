import { Vector } from "p5";

const MAX_SIZE = 20;
const MIN_SIZE = 3;

export default class WordBall {
  constructor({ p, word, count, containerCenter, containerSize }) {
    this.word = word;
    this.count = count;
    this.containerCenter = containerCenter;
    this.containerSize = containerSize;

    this.maxspeed = 0.5;
    this.maxforce = 0.15;

    this.position = this.randomPointInCircle({
      p,
      centerPosition: containerCenter,
      circleRadius: containerSize,
    });
    this.velocity = Vector.random2D();
    this.acceleration = p.createVector(0, 0);
  }

  incrementCount() {
    this.count++;
  }

  randomPointInCircle({ p, centerPosition, circleRadius }) {
    const angle = p.random() * p.TWO_PI;
    const radius = p.random(0, circleRadius);

    const x = p.cos(angle) * radius + centerPosition.x;
    const y = p.sin(angle) * radius + centerPosition.y;

    return p.createVector(x, y);
  }

  applyForce(force, p) {
    // F / M = A
    this.acceleration.add(force.div(this.getSize(p) * 0.25));
  }

  behaviors({ p, wordBalls }) {
    const separateForce = this.separate({ p, wordBalls });
    const boundriesForce = this.boundries(p);

    separateForce.mult(1.5);
    boundriesForce.mult(2.0);

    this.applyForce(separateForce, p);
    this.applyForce(boundriesForce, p);
  }

  update(p) {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  separate({ p, wordBalls }) {
    let desiredseparation = this.getSize(p) * 2;
    let sum = p.createVector();
    let count = 0;

    // For every boid in the system, check if it's too close
    wordBalls.forEach((other) => {
      const d = Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredseparation) {
        const diff = Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    });

    // Average -- divide by how many
    if (count > 0) {
      // Our desired vector is the average scaled to maximum speed
      sum.setMag(this.maxspeed);
      // Implement Reynolds: Steering = Desired - Velocity
      let steer = Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    }

    return p.createVector(0, 0);
  }

  boundries(p) {
    const distanceFromCenter = Vector.dist(this.position, this.containerCenter);
    if (distanceFromCenter > this.containerSize) {
      const desiredPosition = this.randomPointInCircle({
        p,
        centerPosition: this.containerCenter,
        circleRadius: this.containerSize,
      });

      const desired = Vector.sub(desiredPosition, this.position);

      desired.normalize();
      desired.mult(this.maxspeed);
      let steer = Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    }

    return p.createVector(0, 0);
  }

  getSize(p) {
    const clampedCount = p.constrain(this.count, 0, MAX_SIZE);
    const size = p.map(clampedCount, 1, MAX_SIZE, MIN_SIZE, MAX_SIZE);
    return size;
  }

  draw(p) {
    p.fill(255);
    p.circle(this.position.x, this.position.y, this.getSize(p));
  }
}
