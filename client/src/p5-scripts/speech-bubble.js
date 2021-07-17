import stem from "wink-porter2-stemmer";
import { isUndefined } from "lodash";

import {
  getWordCountsById,
  getWordsInCommonById,
  getPrevId,
  getConsecutiveWordCounts,
} from "../data/data-processor";
import WordBall from "./word-ball";
import Link from "./link";
// import P5sound from "p5/lib/addons/p5.sound";

export default class SpeechBubble {
  constructor({ p, id, visibleBubbleCount, index, speechBubbleMap }) {
    this.id = id;
    this.speechBubbleMap = speechBubbleMap;
    // this.text = text;
    // this.filename = filename;
    // this.duration = duration;
    this.wordBalls = [];
    this.links = [];

    // this.audio = p.loadSound(`media/audio/${this.filename}`, () => {
    //   this.audio.play();
    // });

    // this.words = this.getNormalizedWords(this.text);
    // this.processedWordIndex = 0;
    this.wordToBallMap = {};

    const angle = (p.TWO_PI / visibleBubbleCount) * index;
    const r = (2 * p.width) / visibleBubbleCount;
    const x = r * p.cos(angle) + p.width / 2;
    const y = r * p.sin(angle) + p.height / 2;

    this.position = p.createVector(x, y);
    this.size = r / 4;

    // this.position = p.createVector(p.width / 2, p.height / 2);
    // this.size = (p.height * 0.75) / 2;
    this.phase = 0;
    this.zOff = 0;
    this.noiseMax = 3;

    // this.processTextOverTime(p);
    // this.audio.play();
    this.generateWordBalls(p);
    this.generateLinks(p);
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

  generateWordBalls(p) {
    const wordCounts = getWordCountsById(this.id);
    // processedWords = processedWords.splice(0, 10);
    Object.keys(wordCounts).forEach((word) => {
      const count = wordCounts[word];
      const wordBall = new WordBall({
        p,
        word,
        count,
        containerCenter: this.position,
        containerSize: this.size,
      });
      this.wordBalls.push(wordBall);
      this.wordToBallMap[word] = wordBall;
    });
  }

  getWordBall(word) {
    return this.wordToBallMap[word];
  }

  generateLinks(p) {
    const prevBubbleId = getPrevId(this.id);
    if (isUndefined(prevBubbleId)) return;

    const prevSpeechBubble = this.speechBubbleMap[prevBubbleId];

    const wordsInCommon = getWordsInCommonById(this.id);
    const consecutiveWordCount = getConsecutiveWordCounts(this.id);

    wordsInCommon.forEach((word, index) => {
      const startWordBall = prevSpeechBubble.getWordBall(word);
      const endWordBall = this.getWordBall(word);
      const weight = consecutiveWordCount?.[word] || 1;

      const link = new Link({
        p,
        start: startWordBall.position,
        end: endWordBall.position,
        weight,
      });
      this.links.push(link);
    });

    // this.getWordBallFromSpeechBall({ id: this.id, word: wordsInCommon[0] });
  }

  processTextOverTime(p) {
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
          p,
          word,
          count: 1,
          containerCenter: this.position,
          containerSize: this.size / 2,
        });

        this.wordBalls.push(wordBall);
        this.wordToBallMap[word] = wordBall;
      }

      this.generateLinkForWordAtIndex({ p, index: this.processedWordIndex });
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

  generateLinkForWordAtIndex({ p, index }) {
    if (index === 0) return;
    const startWord = this.words[index - 1];
    const endWord = this.words[index];

    const startWordBall = this.wordToBallMap[startWord];
    const endWordBall = this.wordToBallMap[endWord];

    const link = new Link({
      p,
      start: startWordBall.position,
      end: endWordBall.position,
    });
    this.links.push(link);
  }

  drawSpeechBubble(p) {
    let xOffset = p.sin(this.zOff * 0.05) * 100;
    let yOffset = p.cos(this.zOff * 0.05) * 100;

    // console.log("xOffset,yOffset", xOffset, yOffset);
    p.push();
    p.translate(this.position.x, this.position.y);

    const ringCount = 50;
    const circleResolution = 200;
    const angleIncr = p.TWO_PI / circleResolution;

    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      p.beginShape();
      p.noFill();
      p.strokeWeight((ringIndex * 5) / circleResolution);
      p.stroke((ringIndex + this.zOff * 500) % 100, 50, 100);
      for (let angle = 0; angle < p.TWO_PI; angle += angleIncr) {
        //   let xoff = p.map(p.cos(angle + this.phase), -1, 1, 0, this.noiseMax);
        //   let yoff = p.map(p.sin(angle + this.phase), -1, 1, 0, this.noiseMax);

        //   const r = p.map(
        //     p.noise(xoff, yoff, this.zoff),
        //     0,
        //     1,
        //     this.size,
        //     p.height / 2
        //   );
        const r = this.size * 2;
        const n = p.noise(
          xOffset + p.sin(angle) * 0.01 * ringIndex,
          yOffset + p.cos(angle) * 0.01 * ringIndex,
          this.zOff
        );
        //   console.log(n);
        let x = r * n * p.cos(angle);
        let y = r * n * p.sin(angle);
        //   console.log("x,y", x, y);
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }
    p.pop();

    this.phase += 0.005;
    this.zOff += 0.0003;
  }

  draw(p) {
    // this.drawSpeechBubble(p);
    // p.noLoop();
    // p.fill(0);
    // p.noStroke();
    // p.stroke(0);
    p.noFill();
    p.stroke(255);
    p.strokeWeight(1);
    // p.circle(this.position.x, this.position.y, this.size * 2);
    //
    this.links.forEach((link) => {
      link.draw(p);
    });

    this.wordBalls.forEach((wordBall) => {
      wordBall.behaviors({ p, wordBalls: this.wordBalls });
      wordBall.update(p);
      wordBall.draw(p);
    });

    // p.noLoop();
  }
}
