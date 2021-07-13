import stem from "wink-porter2-stemmer";
import WordBall from "./word-ball";

export default class SpeechBubble {
  constructor({ text, filename, p5 }) {
    this.text = text;
    this.filename = filename;
    this.wordBalls = [];

    this.position = p5.createVector(p5.width / 2, p5.height / 2);
    this.size = (p5.height * 0.75) / 2;

    let processedWords = this.processText(this.text);

    console.log("processedWords", processedWords);
    // processedWords = processedWords.splice(0, 10);
    processedWords.forEach((processedWord) => {
      const { word, count } = processedWord;
      const wordBall = new WordBall({
        p5,
        word,
        count,
        containerCenter: this.position,
        containerSize: this.size,
      });

      this.wordBalls.push(wordBall);
    });
  }

  processText(text) {
    const processedWords = {};

    const words = text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ")
      .toLowerCase()
      .split(" ");

    words.forEach((word) => {
      const wordStem = stem(word);
      const nextProcessedWordCount = processedWords[wordStem] || 0;
      processedWords[wordStem] = nextProcessedWordCount + 1;
    });

    const processedWordsArray = Object.keys(processedWords).map((word) => {
      return { word, count: processedWords[word] };
    });

    return processedWordsArray;
  }

  draw(p5) {
    p5.fill(0);
    p5.circle(this.position.x, this.position.y, this.size * 2);

    this.wordBalls.forEach((wordBall) => {
      wordBall.behaviors({ p5, wordBalls: this.wordBalls });
      wordBall.update(p5);

      wordBall.draw(p5);
    });
  }
}
