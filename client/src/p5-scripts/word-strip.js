import {
  getWordCountsById,
  getWordsInCommonById,
  getPrevId,
  getNextId,
  getConsecutiveWordCounts,
} from "../data/data-processor";

import { isUndefined, sortBy, takeRight } from "lodash";
import WordDot from "./word-dot";
import Link from "./link";
import Wire from "./wire";

const TOP_PADDING = 20;
const BOTTOM_PADDING = 60;
const LEFT_PADDING = 10;
const WORD_DOT_PADDING = 5;

const MAX_WORD_DOTS = 80;
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
    this.position = p.createVector(x, p.height - BOTTOM_PADDING);

    this.wordCounts = { ...getWordCountsById(this.id) };
    this.wordsInCommon = getWordsInCommonById(this.id);

    this.wordDots = [];
    this.wordDotMap = {};

    this.links = [];
    this.wires = [];

    this.hadPrinted = false;
  }

  getWordDot(word) {
    return this.wordDotMap[word];
  }

  initialize() {
    this.generateWordDots();
    this.generateLinks();
  }

  shufflePart(array, part) {
    const shuffledArray = [...array];

    const startPos = Math.floor(array.length * part);
    const shuffledPart = shuffledArray.length - startPos;

    for (let i = startPos; i < shuffledArray.length; i++) {
      const randomIndex = Math.floor(Math.random() * shuffledPart) + startPos;

      const temp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temp;
    }

    return shuffledArray;
  }

  getSortedWordKeys() {
    const prevId = getNextId(this.id);
    const consecutiveWordCounts = getConsecutiveWordCounts(this.id);
    const prevConsecutiveWordCounts = getConsecutiveWordCounts(prevId);

    const wordKeys = Object.keys(this.wordCounts);

    const sortedWordKeys = sortBy(wordKeys, (wordKey) => {
      const consecutiveWordCount = consecutiveWordCounts?.[wordKey] || 0;
      const prevConsecutiveWordCount =
        prevConsecutiveWordCounts?.[wordKey] || 0;
      return consecutiveWordCount + prevConsecutiveWordCount;
      // const count = this.wordCounts[wordKey];
      // return count;
    });

    return this.shufflePart(sortedWordKeys, 0.5);
  }

  generateWordDots() {
    let wordKeys = this.getSortedWordKeys();

    wordKeys = takeRight(wordKeys, MAX_WORD_DOTS);

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

      console.log(
        "verticalPosition",
        verticalPosition,
        "wordDot.height",
        wordDot.height
      );
      verticalPosition = verticalPosition - (wordDot.height + WORD_DOT_PADDING);
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
      const wire = new Wire({
        start: startWordBall.position,
        end: endWordBall.position,
        p: this.p,
        weight,
        word,
      });
      this.wires.push(wire);
    });
  }

  update() {
    this.wordDots.forEach((wordDot) => wordDot.update());
    this.wires.forEach((wire) => wire.update());
  }

  draw(p) {
    this.update();

    this.wordDots.forEach((wordDot) => {
      wordDot.draw(p);
    });

    // this.links.forEach((link) => link.draw(this.p));
    this.wires.forEach((wire) => wire.draw(this.p));
  }
}
