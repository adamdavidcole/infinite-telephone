import { Vector } from "p5";

const MAX_SIZE = 20;
const MIN_SIZE = 3;

export default class WordBall {
  constructor({ p5, word, count, containerCenter, containerSize }) {
    this.word = word;
    this.count = count;
    this.containerCenter = containerCenter;
    this.containerSize = containerSize;

    this.maxspeed = 3;
    this.maxforce = 0.15;

    this.position = this.randomPointInCircle({
      p5,
      centerPosition: containerCenter,
      circleRadius: containerSize,
    });
    this.velocity = Vector.random2D();
    this.acceleration = p5.createVector(0, 0);
  }

  randomPointInCircle({ p5, centerPosition, circleRadius }) {
    const angle = p5.random() * p5.TWO_PI;
    const radius = p5.random(0, circleRadius);

    const x = p5.cos(angle) * radius + centerPosition.x;
    const y = p5.sin(angle) * radius + centerPosition.y;

    return p5.createVector(x, y);
  }

  applyForce(force, p5) {
    // F / M = A
    this.acceleration.add(force.div(this.getSize(p5) * 0.25));
  }

  behaviors({ p5, wordBalls }) {
    const separateForce = this.separate({ p5, wordBalls });
    const boundriesForce = this.boundries(p5);

    separateForce.mult(1.5);
    boundriesForce.mult(2.0);

    this.applyForce(separateForce, p5);
    this.applyForce(boundriesForce, p5);
  }

  update(p5) {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  separate({ p5, wordBalls }) {
    let desiredseparation = this.getSize(p5) * 2;
    let sum = p5.createVector();
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

    return p5.createVector(0, 0);
  }

  boundries(p5) {
    const distanceFromCenter = Vector.dist(this.position, this.containerCenter);
    if (distanceFromCenter > this.containerSize) {
      const desiredPosition = this.randomPointInCircle({
        p5,
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

    return p5.createVector(0, 0);
  }

  getSize(p5) {
    const clampedCount = p5.constrain(this.count, 0, MAX_SIZE);
    const size = p5.map(clampedCount, 1, MAX_SIZE, MIN_SIZE, MAX_SIZE);
    return size;
  }

  draw(p5) {
    p5.fill(255);
    p5.circle(this.position.x, this.position.y, this.getSize(p5));
  }
}
