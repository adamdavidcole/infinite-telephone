import AudioRing from "./audio-ring";
import isMobile from "../../utilities/is-mobile";

let recorderVisualizerSketch = (p, props) => {
  const { height } = props;

  let mic;
  let amplitude;
  let audioRing;
  let timestamp = Date.now();

  p.setup = function () {
    p.createCanvas(p.windowWidth, height || p.windowHeight);

    if (!isMobile()) {
      mic = new window.p5.AudioIn();
      mic.start();

      amplitude = mic.amplitude;
      amplitude.toggleNormalize(true);
      amplitude.smooth(0.75);
    }

    audioRing = new AudioRing({ p, amplitude });
  };

  p.draw = () => {
    // console.log(
    //   "audioVisualLiser ID running",
    //   timestamp,
    //   "mic",
    //   mic.getLevel()
    // );
    p.background(17);
    if (audioRing) audioRing.draw(p);
  };

  p.cleanup = () => {
    console.log("recorderVisualizerSketch: cleanup", timestamp);

    if (!isMobile()) {
      mic.stop();
      mic.disconnect();
    }
    p.remove();
  };
};

export default recorderVisualizerSketch;
