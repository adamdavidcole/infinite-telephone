import {
  getWordCountsById,
  getWordsInCommonById,
  getPrevId,
  getNextId,
  getConsecutiveWordCounts,
} from "../data/data-processor";

import { isUndefined } from "lodash";
import WordDot from "./word-dot";
import Link from "./link";

const TOP_PADDING = 20;
const LEFT_PADDING = 10;
const WORD_DOT_PADDING = 5;

export default class WordStrip {
  constructor({ p, id, visibleBubbleCount, index, wordStripMap }) {
    this.p = p;
    this.id = id;
    this.wordStripMap = wordStripMap;

    this.rectWidth = 2;
    this.rectRadius = 2;

    const padding = 50;
    const x = p.map(
      index,
      0,
      visibleBubbleCount - 1,
      this.rectWidth + padding,
      p.width - this.rectWidth - padding
    );
    this.position = p.createVector(x, TOP_PADDING);

    this.wordCounts = { ...getWordCountsById(this.id) };
    this.wordsInCommon = getWordsInCommonById(this.id);

    this.wordDots = [];
    this.wordDotMap = {};

    this.links = [];

    this.hadPrinted = false;
  }

  getWordDot(word) {
    return this.wordDotMap[word];
  }

  initialize() {
    this.generateWordDots();
    this.generateLinks();
  }

  generateWordDots() {
    const wordKeys = Object.keys(this.wordCounts);

    let verticalPosition = this.position.y;
    let horizontalPosition = this.position.x;
    wordKeys.forEach((word, i) => {
      // if (verticalPosition + TOP_PADDING > this.p.height) return;

      const count = this.wordCounts[word];

      const wordDot = new WordDot({
        x: horizontalPosition,
        y: verticalPosition,
        count,
        p: this.p,
      });

      this.wordDots.push(wordDot);
      this.wordDotMap[word] = wordDot;

      verticalPosition += wordDot.height + WORD_DOT_PADDING;
    });
  }

  generateLinks(p) {
    const prevId = getPrevId(this.id);
    if (isUndefined(prevId)) return;

    const prevWordStrip = this.wordStripMap[prevId];
    if (!prevWordStrip) return;

    console.log("prevId", prevId, prevWordStrip);

    const wordsInCommon = getWordsInCommonById(this.id);
    const consecutiveWordCount = getConsecutiveWordCounts(this.id);

    wordsInCommon.forEach((word, index) => {
      const startWordBall = prevWordStrip.getWordDot(word);
      const endWordBall = this.getWordDot(word);
      const weight = consecutiveWordCount?.[word] || 1;
      if (!startWordBall || !endWordBall) {
        console.log("missing ball for link", word, this.id);
        return;
      }

      const link = new Link({
        p: this.p,
        start: startWordBall.position,
        end: endWordBall.position,
        weight,
        word,
      });
      this.links.push(link);
    });
  }

  draw(p) {
    this.wordDots.forEach((wordDots) => {
      wordDots.draw(p);
    });

    this.links.forEach((link) => link.draw(this.p));
  }
}
