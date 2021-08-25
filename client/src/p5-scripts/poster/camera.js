export default class Camera {
  constructor(fps = 30, duration = 15000, p) {
    this.fps = fps;
    this.capturer = new window.CCapture({
      format: "png",
      framerate: fps,
    });
    this.startMillis = null;
    this.duration = duration;
    this.p = p;
  }

  setup() {
    this.p.frameRate(this.fps);
  }

  endRecording() {
    this.p.noLoop();
    console.log("finished recording.");
    this.capturer.stop();
    this.capturer.save();
  }

  record() {
    if (this.p.frameCount === 1) {
      // start the recording on the first frame
      // this avoids the code freeze which occurs if capturer.start is called
      // in the setup, since v0.9 of p5.js
      console.log("start capture");
      this.capturer.start();
    }

    if (this.startMillis == null) {
      this.startMillis = this.p.millis();
    }

    // compute how far we are through the animation as a value between 0 and 1.
    var elapsed = this.p.millis() - this.startMillis;
    var t = this.p.map(elapsed, 0, this.duration, 0, 1);

    // if we have passed t=1 then end the animation.
    if (t > 1) {
      this.endRecording();
      return;
    }

    console.log("capturing frame", this.p.frameCount);
    this.capturer.capture(document.getElementById("defaultCanvas0"));
  }
}
