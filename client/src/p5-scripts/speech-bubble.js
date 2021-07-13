import stem from "wink-porter2-stemmer";
import WordBall from "./word-ball";
import Link from "./link";

export default class SpeechBubble {
  constructor({ text, filename, duration, p5 }) {
    this.text = text;
    this.filename = filename;
    this.duration = duration;
    this.wordBalls = [];
    this.links = [];

    this.words = this.getNormalizedWords(this.text);
    this.processedWordIndex = 0;
    this.wordToBallMap = {};

    this.position = p5.createVector(p5.width / 2, p5.height / 2);
    this.size = (p5.height * 0.75) / 2;

    this.processTextOverTime(p5);
    // this.processAllText(p5);
  }

  getNormalizedWords(text) {
    const words = text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ")
      .toLowerCase()
      .split(" ")
      .map(stem);

    return words;
  }

  processAllText(p5) {
    let processedWords = this.processText(this.text);
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

  processTextOverTime(p5) {
    const intervalDuration = this.duration / this.words.length;

    const processTextInterval = setInterval(() => {
      if (this.processedWordIndex === this.words.length) {
        clearInterval(processTextInterval);
        return;
      }

      const word = this.words[this.processedWordIndex];

      if (this.wordToBallMap[word]) {
        // existing word: increment count
        const wordBall = this.wordToBallMap[word];
        wordBall.incrementCount();
      } else {
        // new word, create word ball
        const wordBall = new WordBall({
          p5,
          word,
          count: 1,
          containerCenter: this.position,
          containerSize: this.size,
        });

        this.wordBalls.push(wordBall);
        this.wordToBallMap[word] = wordBall;
      }

      this.generateLinkForWordAtIndex({ p5, index: this.processedWordIndex });
      this.processedWordIndex++;
    }, intervalDuration);
  }

  processText(text) {
    const processedWords = {};

    const words = this.getNormalizedWords(text);

    words.forEach((word) => {
      const nextProcessedWordCount = processedWords[word] || 0;
      processedWords[word] = nextProcessedWordCount + 1;
    });

    const processedWordsArray = Object.keys(processedWords).map((word) => {
      return { word, count: processedWords[word] };
    });

    return processedWordsArray;
  }

  generateLinkForWordAtIndex({ p5, index }) {
    if (index === 0) return;
    const startWord = this.words[index - 1];
    const endWord = this.words[index];

    const startWordBall = this.wordToBallMap[startWord];
    const endWordBall = this.wordToBallMap[endWord];

    const link = new Link({
      p5,
      start: startWordBall.position,
      end: endWordBall.position,
    });
    this.links.push(link);
  }

  draw(p5) {
    // p5.fill(0);
    // p5.noStroke();
    // p5.stroke(0);
    // p5.circle(this.position.x, this.position.y, this.size * 2);

    // this.links.forEach((link) => {
    //   link.draw(p5);
    // });

    this.wordBalls.forEach((wordBall) => {
      wordBall.behaviors({ p5, wordBalls: this.wordBalls });
      wordBall.update(p5);

      wordBall.draw(p5);
    });
  }
}
