class AudioData {
  constuctor() {
    this.transcript = "";
    this.processedWords = {};
  }

  processTranscriptionResult({ resultText }) {
    if (!resultText) return;

    const nextProcessedWords = { ...this.processedWords };

    const words = resultText.toLowerCase().split(" ");

    words.forEach((word) => {
      const nextProcessedWordCount = nextProcessedWords[word] || 0;
      nextProcessedWords[word] = nextProcessedWordCount + 1;
    });

    this.processedWords = nextProcessedWords;
  }
}
