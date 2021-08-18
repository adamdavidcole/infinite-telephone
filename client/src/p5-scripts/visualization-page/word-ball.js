import { Vector } from "p5";
import { noop } from "lodash";

const MAX_SIZE = 20;
const MIN_SIZE = 3;

export default class WordBall {
  constructor({
    p,
    word,
    count,
    containerCenter,
    containerSize,
    path,
    maxspeed,
  }) {
    this.word = word;
    this.count = count;
    this.containerCenter = containerCenter;
    this.containerSize = containerSize;

    this.maxspeed = maxspeed || 0.05;
    this.maxforce = 0.15;

    this.position = this.randomPointInCircle({
      p,
      centerPosition: containerCenter,
      circleRadius: containerSize,
    });
    this.velocity = Vector.random2D();
    this.acceleration = p.createVector(0, 0);
    this.path = path;
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
    const hasPath = this.path && this.path.exists();
    const followForce = this.follow({ p, path: this.path });
    const separateForce = hasPath ? undefined : this.separate({ p, wordBalls });
    const boundriesForce = hasPath ? undefined : this.boundries(p);

    followForce.mult(1.0);
    if (!hasPath) separateForce.mult(1.5);
    if (!hasPath) boundriesForce.mult(2.0);

    this.applyForce(followForce, p);
    if (!hasPath) this.applyForce(separateForce, p);
    if (!hasPath) this.applyForce(boundriesForce, p);
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

  // This function implements Craig Reynolds' path following algorithm
  // http://www.red3d.com/cwr/steer/PathFollow.html
  follow({ p, path }) {
    if (!path || !path.exists()) return p.createVector(0, 0);

    // Predict location 50 (arbitrary choice) frames ahead
    // This could be based on speed
    let predict = this.velocity.copy();
    predict.normalize();
    predict.mult(75);
    let predictLoc = Vector.add(this.position, predict);

    // Now we must find the normal to the path from the predicted location
    // We look at the normal for each line segment and pick out the closest one

    let normal = null;
    let target = null;
    let worldRecord = 1000000; // Start with a very high record distance that can easily be beaten

    // Loop through all points of the path
    for (let i = 0; i < path.points.length - 1; i++) {
      // Look at a line segment
      let a = path.points[i];
      let b = path.points[i + 1];
      //println(b);

      // Get the normal point to that line
      let normalPoint = this.getNormalPoint(predictLoc, a, b);
      // This only works because we know our path goes from left to right
      // We could have a more sophisticated test to tell if the point is in the line segment or not
      if (normalPoint.x < a.x || normalPoint.x > b.x) {
        // This is something of a hacky solution, but if it's not within the line segment
        // consider the normal to just be the end of the line segment (point b)
        normalPoint = b.copy();
      }

      // How far away are we from the path?
      let distance = Vector.dist(predictLoc, normalPoint);
      // Did we beat the record and find the closest line segment?
      if (distance < worldRecord) {
        worldRecord = distance;
        // If so the target we want to steer towards is the normal
        normal = normalPoint;

        // Look at the direction of the line segment so we can seek a little bit ahead of the normal
        let dir = Vector.sub(b, a);
        dir.normalize();
        // This is an oversimplification
        // Should be based on distance to path & velocity
        dir.mult(10);
        target = normalPoint.copy();
        target.add(dir);
      }
    }

    // Only if the distance is greater than the path's radius do we bother to steer
    if (worldRecord > path.radius && target !== null) {
      return this.seek({ target, p });
    }

    return p.createVector(0, 0);

    // Draw the debugging stuff
    // if (this.debug) {
    //   // Draw predicted future location
    //   p.stroke(255);
    //   p.fill(200);
    //   p.line(this.position.x, this.position.y, predictLoc.x, predictLoc.y);
    //   p.ellipse(predictLoc.x, predictLoc.y, 4, 4);

    //   // Draw normal location
    //   p.stroke(255);
    //   p.fill(200);
    //   p.ellipse(normal.x, normal.y, 4, 4);
    //   // Draw actual target (red if steering towards it)
    //   p.line(predictLoc.x, predictLoc.y, normal.x, normal.y);
    //   if (worldRecord > p.radius) p.fill(255, 0, 0);
    //   p.noStroke();
    //   p.ellipse(target.x, target.y, 8, 8);
    // }
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek({ p, target }) {
    let desired = Vector.sub(target, this.position); // A vector pointing from the position to the target

    // If the magnitude of desired equals 0, skip out of here
    // (We could optimize this to check if x and y are 0 to avoid mag() square root
    if (desired.mag() === 0) return;

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    // this.applyForce(steer, p);
    return steer;
  }

  // A function to get the normal point from a point (p) to a line segment (a-b)
  // This function could be optimized to make fewer new Vector objects
  getNormalPoint(point, a, b) {
    // Vector from a to p
    let ap = Vector.sub(point, a);
    // Vector from a to b
    let ab = Vector.sub(b, a);
    ab.normalize(); // Normalize the line
    // Project vector "diff" onto line by using the dot product
    ab.mult(ap.dot(ab));
    let normalPoint = Vector.add(a, ab);
    return normalPoint;
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
    p.noStroke();
    p.fill(200);
    p.circle(this.position.x, this.position.y, this.getSize(p));
  }
}
