import AudioRing from "./audio-ring";

let audioVisualizerSketch = (p, props) => {
  const { audioFilenameAsMp3, onAudioEnded, useMicAsSource, height } = props;

  console.log("p", p);

  console.log("useMicAsSource", useMicAsSource);

  const size = 50;

  let song;
  let mic;
  let amplitude;
  let audioRing;

  let hasInitializedAudio = false;

  function initializeAudio() {
    hasInitializedAudio = true;

    if (useMicAsSource) {
      // TODO: Mic in doesn't work when song has been played earlier
      mic = new window.p5.AudioIn();
      mic.start();
    } else {
      song.onended(() => {
        console.log("audioVisualizerSketch: audio has ended");
        onAudioEnded();
      });

      song.play();
    }

    amplitude = useMicAsSource ? mic.amplitude : new window.p5.Amplitude();
    amplitude.toggleNormalize(true);
    amplitude.smooth(0.75);

    audioRing = new AudioRing({ p, amplitude });
  }

  p.preload = () => {
    if (!useMicAsSource && audioFilenameAsMp3) {
      song = p.loadSound(audioFilenameAsMp3);
      console.log("song", song);
    }
  };

  p.setup = function () {
    if (!useMicAsSource && !audioFilenameAsMp3) {
      onAudioEnded();
    }

    // if (!useMicAsSource && audioFilenameAsMp3) {
    //   song = new window.p5.SoundFile(audioFilenameAsMp3);
    // }

    p.createCanvas(p.windowWidth, height || p.windowHeight);

    // if (useMicAsSource) {
    //   // TODO: Mic in doesn't work when song has been played earlier
    //   mic = new AudioIn();
    //   mic.start();
    // } else {
    //   song.onended(() => {
    //     console.log("audioVisualizerSketch: audio has ended");
    //     onAudioEnded();
    //   });

    //   song.play();
    // }

    // console.log("mic", mic);

    // amplitude = useMicAsSource ? mic.amplitude : new Amplitude();
    // amplitude.toggleNormalize(true);
    // amplitude.smooth(0.75);

    // audioRing = new AudioRing({ p, amplitude });
  };

  p.draw = () => {
    if (!hasInitializedAudio) {
      if (useMicAsSource) {
        initializeAudio();
      } else if (song && song.isLoaded()) {
        initializeAudio();
      }
    }

    p.background(17);
    if (audioRing) audioRing.draw(p);
  };
};

export default audioVisualizerSketch;
