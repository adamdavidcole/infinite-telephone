import { first, nth } from "lodash";
import {
  getAudioFilenameById,
  getDurationById,
} from "../../data/data-processor.js";
import ANIMATION_STATUS from "../../utilities/animation-status";

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;
export const MAX_ANIMATION_DURATION = 5200;
const MIN_ANIMATION_DURATION = 3700;
const MIN_FADE_TIME = 500;

export default class SceneManager {
  constructor({ wordStrips, audioManager }) {
    this.wordStrips = wordStrips;
    this.audioManager = audioManager;
    this.animationStatus = {};

    this.animationStateById = {};

    this.currentlyAnimatingIndex = 0;
    this.startAnimation(this.currentlyAnimatingIndex);
  }

  getWordStrip(index) {
    return nth(this.wordStrips, index % this.wordStrips.length);
  }

  startAnimation(index) {
    console.log("SceneManager: Starting animation for", index);
    const animatingWordStrip = this.getWordStrip(index);

    const id = animatingWordStrip.id;
    const duration = getDurationById(id) || MAX_ANIMATION_DURATION;
    const maxAnimationDuration = Math.min(duration, MAX_ANIMATION_DURATION);
    const minimumAnimationDuration = Math.min(duration, MIN_ANIMATION_DURATION);

    let animationDuration = Math.floor(
      Math.random() * (maxAnimationDuration - minimumAnimationDuration + 1) +
        minimumAnimationDuration
    );

    animationDuration = animationDuration - MIN_FADE_TIME;

    console.log(
      "STARTING ANIMATION: animationDuration",
      animationDuration,
      "duration",
      duration,
      "maxAnimationDuration",
      maxAnimationDuration
    );

    const animationState = {
      animationStatus: ANIMATING,
      animationStartTime: Date.now(),
      animationDuration,
    };
    this.animationStateById[index % this.wordStrips.length] = animationState;

    animatingWordStrip?.startAnimation(animationState);
    this.audioManager?.beginAudioById(id);
  }

  endAnimation(index) {
    console.log("SceneManager: Ending animation for", index);
    const animatingWordStrip = this.getWordStrip(index);
    if (!animatingWordStrip) return;

    const animationState = {
      animationStatus: AFTER_ANIMATION,
      animationStartTime: undefined,
    };
    this.animationStateById[index % this.wordStrips.length] = animationState;

    animatingWordStrip?.endAnimation(animationState);

    const id = animatingWordStrip.id;
    this.audioManager?.beginAudioFadeOut(id);
  }

  hasAnimationCompleted(index) {
    const { animationStatus, animationStartTime, animationDuration } =
      this.animationStateById[index % this.wordStrips.length] || {};
    if (animationStatus === AFTER_ANIMATION) return true;
    if (!animationStartTime) return false;

    const timeElapsed = Date.now() - animationStartTime;
    return timeElapsed > animationDuration;
  }

  update() {
    const animatingWordStrip = this.getWordStrip(this.currentlyAnimatingIndex);

    if (this.hasAnimationCompleted(this.currentlyAnimatingIndex)) {
      this.endAnimation(this.currentlyAnimatingIndex);

      this.currentlyAnimatingIndex += 1;
      this.startAnimation(this.currentlyAnimatingIndex);
    }
  }
}
