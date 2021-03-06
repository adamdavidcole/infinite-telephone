import {
  getWordCountsById,
  getWordsInCommonById,
  getPrevId,
  getNextId,
  getConsecutiveWordCounts,
  getAudioFilenameById,
} from "../../data/data-processor.js";

import { isUndefined, sortBy, takeRight, take, drop, isNumber } from "lodash";
import WordDot from "./word-dot";
import Link from "./link";
import Wire from "./wire";
import ANIMATION_STATUS from "../../utilities/animation-status";
import { SHOULD_ANIMATE } from "../../utilities/constants.js";

const OUTSIDE_BOUNDS = -500;

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;

const TOP_PADDING = 20;
const BOTTOM_PADDING = 60;
const LEFT_PADDING = 100;
const WORD_DOT_PADDING = 5;

const MAX_WORD_DOTS = 125;
export default class WordStrip {
  constructor({ p, id, visibleBubbleCount, index, wordStripMap }) {
    this.p = p;
    this.id = id;
    this.wordStripMap = wordStripMap;
    this.index = index;

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
    if (SHOULD_ANIMATE) {
      this.position = p.createVector(
        p.width - LEFT_PADDING,
        p.height - BOTTOM_PADDING
      );
    } else {
      this.position = p.createVector(x, p.height - BOTTOM_PADDING);
    }

    this.wordCounts = { ...getWordCountsById(this.id) };
    this.wordsInCommon = getWordsInCommonById(this.id);

    this.animationDuration = 10000;
    this.animationStatus = BEFORE_ANIMATION;
    this.animationStartTime = undefined;

    this.wordDots = [];
    this.wordDotMap = {};
    this.wordDotAnimationRelativeSpeed = 1.2;

    this.links = [];
    this.wires = [];

    this.hadPrinted = false;
  }

  getWordDot(word) {
    return this.wordDotMap[word];
  }

  initialize() {
    this.wordDots = [];
    this.wordDotMap = {};
    this.links = [];
    this.wires = [];

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

    let shuffledWordKeys = this.shufflePart(sortedWordKeys, 0.5);
    return shuffledWordKeys;
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
        word,
        x: horizontalPosition,
        y: verticalPosition,
        count,
        p: this.p,
        index: i,
        totalWords: wordKeys.length,
      });

      this.wordDots.push(wordDot);
      this.wordDotMap[word] = wordDot;

      verticalPosition = verticalPosition - (wordDot.height + WORD_DOT_PADDING);
    });
  }

  getHorizontalPosition() {
    if (!this.wordDots || !this.wordDots.length) return;

    return this.wordDots[0].position?.x;
  }

  isOutsideBounds() {
    const horizontalPosition = this.getHorizontalPosition();
    return horizontalPosition < OUTSIDE_BOUNDS;
  }

  generateLinks(p) {
    const prevId = getPrevId(this.id);
    if (isUndefined(prevId)) return;

    const prevWordStrip = this.wordStripMap[prevId];
    if (!prevWordStrip) return;

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

  startAnimation({ animationStartTime, animationStatus, animationDuration }) {
    this.animationStartTime = animationStartTime;
    this.animationStatus = animationStatus;
    this.animationDuration = animationDuration;

    // MAYBE?
    this.initialize();

    // this.playAudio();

    this.wires.forEach((wire) => {
      wire.setAnimationStatus({
        animationStatus: this.animationStatus,
        animationStartTime: this.animationStartTime,
        animationDuration: this.animationDuration,
      });
    });

    // console.log("start word-strip animation", animationDuration);
    this.wordDots.forEach((wordDot) => {
      wordDot.setAnimationDuration(
        animationDuration / this.wordDotAnimationRelativeSpeed
      );
    });
  }

  endAnimation() {
    this.animationStartTime = undefined;
    this.animationStatus = AFTER_ANIMATION;
  }

  isDoneAnimating() {
    if (this.animationStatus === AFTER_ANIMATION) return true;

    const timeElapsed = Date.now() - this.animationStartTime;
    return timeElapsed > this.animationDuration;
  }

  getAnimationProgress() {
    if (this.animationStatus === BEFORE_ANIMATION) return 0;
    if (this.animationStatus === AFTER_ANIMATION) return 1;

    const timeElapsed = Date.now() - this.animationStartTime;
    const animationProgress = timeElapsed / this.animationDuration;
    return Math.min(animationProgress, 1);
  }

  getWordDotsToDrawCount() {
    const relativeSpeed = this.wordDotAnimationRelativeSpeed;
    const wordDotsToDrawCount = Math.floor(
      this.getAnimationProgress() * this.wordDots.length * relativeSpeed
    );

    return Math.min(this.wordDots.length, wordDotsToDrawCount);
  }

  update() {
    this.wordDots.forEach((wordDot) => wordDot.update());
    this.wires.forEach((wire) => wire.update());
  }

  draw(p) {
    if (this.isOutsideBounds()) {
      return;
    }

    this.update();

    for (let i = 0; i < this.getWordDotsToDrawCount(); i++) {
      const wordDot = this.wordDots[i];
      wordDot.draw(p);
    }

    //  DRAW CURVE
    // if (this.wordDots?.length > 3) {
    //   p.noFill();
    //   p.stroke(200);
    //   p.strokeWeight(20);
    //   const head = this.wordDots[0].position;
    //   const tail = this.wordDots[this.getWordDotsToDrawCount()]?.position;
    //   p.noFill();
    //   p.beginShape();
    //   p.curveVertex(head.x, head.y);
    //   for (let i = 0; i < this.getWordDotsToDrawCount(); i++) {
    //     const wordDot = this.wordDots[i];
    //     const position = wordDot.position;
    //     p.curveVertex(position.x, position.y);
    //   }
    //   p.curveVertex(tail?.x, tail?.y);
    //   p.endShape();
    // }

    // this.links.forEach((link) => link.draw(this.p));
    this.wires.forEach((wire) => wire.draw(this.p));
  }
}
