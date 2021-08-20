import AudioRing from "./audio-ring";

let audioVisualizerSketch = (p, props) => {
  const { audioFilenameAsMp3, onAudioEnded, height } = props;

  let song;
  let amplitude;
  let audioRing;
  let timestamp = Date.now();

  let hasCalledOnEnded = false;

  p.preload = () => {
    console.log("audioFilenameAsMp3", audioFilenameAsMp3);
    if (audioFilenameAsMp3) {
      song = p.loadSound(audioFilenameAsMp3);
    }
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, height || p.windowHeight);

    console.log("audioVisualizerSketch: setup", timestamp);

    song.onended(() => {
      if (hasCalledOnEnded) return;

      // TODO: figure out why onended is called more then once
      hasCalledOnEnded = true;
      console.log("audioVisualizerSketch: audio has ended");
      onAudioEnded();
    });

    song.play();

    amplitude = new window.p5.Amplitude();
    amplitude.toggleNormalize(true);
    amplitude.smooth(0.75);

    audioRing = new AudioRing({ p, amplitude });
  };

  p.draw = () => {
    // console.log("audioVisualLiser ID running", timestamp);
    p.background(17);
    if (audioRing) audioRing.draw(p);
  };

  p.cleanup = () => {
    console.log("audioVisualLiser cleanup", timestamp);
    p.remove();
  };
};

export default audioVisualizerSketch;
