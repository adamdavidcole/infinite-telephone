var SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

class AudioTranscription {
  constructor({ onTranscriptionResult } = {}) {
    if (!this.isAudioTranscriptionSupported()) {
      console.warn("Audio Transcription not supported");
    }

    this.transcript = "";
    this.isTranscribing = false;
    this.onTranscriptionResult = onTranscriptionResult;

    this.onRecognitionResult = this.onRecognitionResult.bind(this);
    this.onRecognitionEnd = this.onRecognitionEnd.bind(this);
  }

  initialize() {
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = this.onRecognitionResult;
    this.recognition.onend = this.onRecognitionEnd;

    this.recognition.onerror = (error) => {
      console.log("AudioTranscription error:", error);
    };
    this.recognition.soundend = () => {
      console.log("AudioTranscription sound end");
    };
    this.recognition.soundend = () => {
      console.log("AudioTranscription speechend end");
    };
  }

  onRecognitionEnd() {
    console.log(
      "onRecognitionEnd: AudioTranscription service disconnected",
      this.isTranscribing
    );

    if (this.isTranscribing) {
      console.log("onRecognitionEnd mid recording: continung transcription");
      this.recognition.stop();
      this.recognition.start();
    }
  }

  onRecognitionResult(event) {
    console.log("event", event);
    const results = event.results;
    const resultIndex = event.resultIndex;
    const resultText = results[resultIndex][0].transcript;

    this.onTranscriptionResult?.({ resultText });

    this.transcript += " " + resultText;

    console.log("recognitionOnResult", this.transcript);
  }

  start() {
    this.isTranscribing = true;
    this.transcript = "";

    console.log("AudioTranscription start", Date.now());
    this.recognition.start();
  }

  stop() {
    this.isTranscribing = false;
    console.log("AudioTranscription end", Date.now());
    this.recognition.stop();

    setTimeout(() => console.log("final transcript: ", this.transcript), 100);
  }

  isAudioTranscriptionSupported() {
    return !!SpeechRecognition;
  }
}

export default AudioTranscription;
