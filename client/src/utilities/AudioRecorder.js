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

  getMimeType() {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
      return "audio/ogg;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    }
  }

  getFileExtension() {
    if (!this.mediaRecorder) return "";

    switch (this.mediaRecorder.mimeType) {
      case "audio/webm;codecs=opus":
        return "webm";
      case "audio/ogg;codecs=opus":
        return "ogg";
      case "audio/mp4":
        return "m4a";
      default:
        return "";
    }
  }

  onMediaRecorderDataAvailable(e) {
    this.chunks.push(e.data);
  }

  onMediaRecorderStop(e) {
    if (!this.shouldDownloadAudio) return;

    console.log("mediaRecorder");

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
    const mimeType = this.getMimeType();
    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    console.log(
      "Created a media recorder with mimetype:",
      this.mediaRecorder.mimeType
    );

    this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable;
    this.mediaRecorder.onstop = this.onMediaRecorderStop;
  }

  onError(err) {
    console.error("Error openeing media stream: " + err);
  }

  initialize() {
    console.log("AudioRecorder: initializing");
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

    // const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
    // const audioURL = window.URL.createObjectURL(blob);

    this.setIsRecording(false);
  }

  getMostRecentAudioBlob() {
    const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
    return blob;
  }
}

export default AudioRecorder;
