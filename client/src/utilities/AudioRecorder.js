class AudioRecorder {
  constraints = { audio: true };

  constructor({ setIsRecording }) {
    this.setIsRecording = setIsRecording;

    this.mediaRecorder = null;
    this.chunks = [];

    this.shouldDownloadAudio = false;

    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    this.onMediaRecorderDataAvailable =
      this.onMediaRecorderDataAvailable.bind(this);
    this.onMediaRecorderStop = this.onMediaRecorderStop.bind(this);
  }

  onMediaRecorderDataAvailable(e) {
    this.chunks.push(e.data);
  }

  onMediaRecorderStop(e) {
    if (!this.shouldDownloadAudio) return;

    const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
    const audioURL = window.URL.createObjectURL(blob);

    return audioURL;

    // const a = document.createElement("a");
    // a.style.display = "none";
    // a.href = audioURL;
    // a.download = `test-${Date.now()}.ogg`;
    // document.body.appendChild(a);
    // a.click();

    // setTimeout(() => {
    //   document.body.removeChild(a);
    //   window.URL.revokeObjectURL(audioURL);
    // }, 100);
  }

  onSuccess(stream) {
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable;
    this.mediaRecorder.onstop = this.onMediaRecorderStop;
  }

  onError(err) {
    console.error("Error openeing media stream: " + err);
  }

  initialize() {
    if (!this.isMediaSupported()) {
      console.warn("user media not supported, can't open stream");
      return;
    }

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(this.onSuccess, this.onError);
  }

  isMediaSupported() {
    return !!navigator?.mediaDevices?.getUserMedia;
  }

  start() {
    this.chunks = [];
    this.mediaRecorder.start();

    this.setIsRecording(true);
  }

  stop() {
    this.mediaRecorder.stop();

    const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
    const audioURL = window.URL.createObjectURL(blob);

    this.setIsRecording(false);
  }

  getMostRecentAudioBlob() {
    const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
    return blob;
  }
}

export default AudioRecorder;
