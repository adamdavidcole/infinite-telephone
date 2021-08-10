import { Amplitude, AudioIn } from "p5";

import AudioRing from "./audio-ring";

let audioVisualizerSketch = (p, props) => {
  const { audioFilenameAsMp3, onAudioEnded, useMicAsSource, height } = props;

  console.log("useMicAsSource", useMicAsSource);

  const size = 50;

  let song;
  let mic;
  let amplitude;
  let audioRing;

  p.preload = () => {
    if (!useMicAsSource && audioFilenameAsMp3) {
      song = p.loadSound(audioFilenameAsMp3);
    }
  };

  p.setup = function () {
    if (useMicAsSource) {
      // TODO: Mic in doesn't work when song has been played earlier
      mic = new AudioIn();
      mic.start();
    } else {
      song.onended(() => {
        console.log("audioVisualizerSketch: audio has ended");
        onAudioEnded();
      });

      song.play();
    }

    console.log("mic", mic);

    p.createCanvas(p.windowWidth, height || p.windowHeight);

    amplitude = useMicAsSource ? mic.amplitude : new Amplitude();
    amplitude.toggleNormalize(true);
    amplitude.smooth(0.75);

    audioRing = new AudioRing({ p, amplitude });
  };

  p.draw = () => {
    p.background(17);
    audioRing.draw(p);
  };
};

export default audioVisualizerSketch;
