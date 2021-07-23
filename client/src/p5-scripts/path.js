// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Path Following

export default class Path {
  constructor() {
    // A path has a radius, i.e how far is it ok for the vehicle to wander off
    this.radius = 5; //20;
    // A Path is an array of points (p5.Vector objects)
    this.points = [];
  }

  // Add a point to the path
  addPoint(point) {
    this.points.push(point);
  }

  exists() {
    return this.points.length > 0;
  }

  clearPoints() {
    this.points = [];
  }

  getStart() {
    return this.points[0];
  }

  getEnd() {
    return this.points[this.points.length - 1];
  }

  // Draw the path
  draw(p) {
    // Draw thick line for radius
    p.stroke(99);
    p.strokeWeight(this.radius * 2);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.points.length; i++) {
      p.vertex(this.points[i].x, this.points[i].y);
    }
    p.endShape(p.CLOSE);
    // Draw thin line for center of path
    p.stroke(255);
    p.strokeWeight(1);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < this.points.length; i++) {
      p.vertex(this.points[i].x, this.points[i].y);
    }
    p.endShape(p.CLOSE);
  }
}
