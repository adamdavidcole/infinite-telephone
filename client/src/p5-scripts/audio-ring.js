import { nth } from "lodash";

export default class AudioRing {
  constructor({ size, amplitude, p }) {
    this.position = p.createVector(p.width / 2, p.height / 2);

    this.phase = 0;
    this.zOff = 0;
    this.noiseMax = 3;

    this.amplitude = amplitude;
    this.amplitudeHistory = [];
    this.amplitudeHistoryWindow = [];
  }

  getRollingAverageAmp() {
    const sum = this.amplitudeHistoryWindow.reduce(
      (sum, currValue) => sum + currValue,
      0
    );
    return sum / this.amplitudeHistoryWindow.length;
  }

  draw(p) {
    const vol = this.amplitude ? this.amplitude.getLevel() : 0;
    const volAvg = this.getRollingAverageAmp();

    const ampIndex = p.frameCount % 200;
    // console.log("ampIndex", ampIndex);
    this.amplitudeHistory[ampIndex] = vol;
    this.amplitudeHistoryWindow.push(vol);

    let xOffset = p.sin(this.zOff * 0.05) * 100;
    let yOffset = p.cos(this.zOff * 0.05) * 100;

    p.push();
    p.translate(this.position.x, this.position.y);

    const ringCount = 50;
    const circleResolution = 200;
    const angleIncr = p.TWO_PI / circleResolution;

    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      p.beginShape();
      p.noFill();
      p.strokeWeight((ringIndex * 5) / circleResolution);
      p.stroke((ringIndex + this.zOff * 500) % 100, 50, 100);

      let index = 0;
      for (let angle = 0; angle < p.TWO_PI; angle += angleIncr) {
        //   let xoff = p.map(p.cos(angle + this.phase), -1, 1, 0, this.noiseMax);
        //   let yoff = p.map(p.sin(angle + this.phase), -1, 1, 0, this.noiseMax);

        //   const r = p.map(
        //     p.noise(xoff, yoff, this.zoff),
        //     0,
        //     1,
        //     this.size,
        //     p.height / 2
        //   );

        const amplitude = nth(this.amplitudeHistory, index) || 0;
        const ampMapped = p.map(amplitude, 0, 0.5, 0, p.height / 10);

        // const volMapped = p.map(vol, 0, 1, 0, 100);

        let r = p.height * 0.5; //this.size * 4;
        // if (ringIndex === ringCount - 1) {

        // TRY
        // using rolling average of amplitude and mapping r using average between min and max
        // map amp to intensity of color

        const volMapped = p.map(
          volAvg,
          0,
          0.5,
          0,
          (r / 2) * (ringIndex / ringCount)
        );
        r += volMapped;
        // }

        let n = p.noise(
          xOffset + p.sin(angle) * 0.01 * ringIndex,
          yOffset + p.cos(angle) * 0.01 * ringIndex,
          this.zOff
        );

        // n = 1;
        //   console.log(n);
        let x = r * n * p.cos(angle);
        let y = r * n * p.sin(angle);
        //   console.log("x,y", x, y);
        p.vertex(x, y);

        index++;
      }
      p.endShape(p.CLOSE);
    }
    p.pop();

    this.phase += 0.005;
    this.zOff += 0.0003;

    // console.log("this.amplitudeHistory", this.amplitudeHistory);
    // if (this.amplitudeHistory.length > circleResolution) {
    //   //   this.amplitudeHistory.splice(0, 1);
    // }
    if (this.amplitudeHistoryWindow.length >= 5) {
      this.amplitudeHistoryWindow.splice(0, 1);
    }
  }
}
