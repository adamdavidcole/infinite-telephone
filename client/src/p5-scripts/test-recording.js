let testRecording = (p) => {
  let mic, recorder, soundFile;
  let state = 0;

  p.setup = () => {
    let cnv = p.createCanvas(100, 100);
    cnv.mousePressed(canvasPressed);
    p.background(220);
    p.textAlign(p.CENTER, p.CENTER);

    // create an audio in
    mic = new window.p5.AudioIn();

    // prompts user to enable their browser mic
    mic.start();

    // create a sound recorder
    recorder = new window.p5.SoundRecorder();

    // connect the mic to the recorder
    recorder.setInput(mic);

    // this sound file will be used to
    // playback & save the recording
    soundFile = new window.p5.SoundFile();

    p.text("tap to record", p.width / 2, p.height / 2);
  };

  function canvasPressed() {
    console.log("canvaspressed");
    // ensure audio is enabled
    p.userStartAudio();

    // make sure user enabled the mic
    if (state === 0 && mic.enabled) {
      // record to our p5.SoundFile
      recorder.record(soundFile);

      p.background(255, 0, 0);
      p.text("Recording!", p.width / 2, p.height / 2);
      state++;
    } else if (state === 1) {
      p.background(0, 255, 0);

      // stop recorder and
      // send result to soundFile
      recorder.stop();

      p.text(
        "Done! Tap to play and download",
        p.width / 2,
        p.height / 2,
        p.width - 20
      );
      state++;
    } else if (state === 2) {
      soundFile.play(); // play the result!
      p.save(soundFile, "mySound.wav");
      state++;
    }
  }
};

export default testRecording;
