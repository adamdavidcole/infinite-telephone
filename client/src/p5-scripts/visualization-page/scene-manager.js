import { first, nth } from "lodash";
import { getAudioFilenameById } from "../../data/data-processor.js";
import ANIMATION_STATUS from "../../utilities/animation-status";

const { BEFORE_ANIMATION, ANIMATING, AFTER_ANIMATION } = ANIMATION_STATUS;
const ANIMATION_DURATION = 10000;

export default class SceneManager {
  constructor({ wordStrips, audioManager }) {
    this.wordStrips = wordStrips;
    this.audioManager = audioManager;
    this.animationStatus = {};

    this.animationStateById = {};
    // this.animationStatus = BEFORE_ANIMATION;
    // this.animationStartTime = undefined;

    this.currentlyAnimatingIndex = 1;
    this.startAnimation(this.currentlyAnimatingIndex);
  }

  startAnimation(index) {
    console.log("SceneManager: Starting animation for", index);
    const animatingWordStrip = nth(this.wordStrips, index);
    if (!animatingWordStrip) return;

    const animationState = {
      animationStatus: ANIMATING,
      animationStartTime: Date.now(),
      animationDuration: ANIMATION_DURATION,
    };
    this.animationStateById[index] = animationState;

    animatingWordStrip?.startAnimation(animationState);

    const id = animatingWordStrip.id;
    this.audioManager.beginAudioById(id);
  }

  endAnimation(index) {
    console.log("SceneManager: Ending animation for", index);
    const animatingWordStrip = nth(this.wordStrips, index);
    if (!animatingWordStrip) return;

    const animationState = {
      animationStatus: AFTER_ANIMATION,
      animationStartTime: undefined,
    };
    this.animationStateById[index] = animationState;

    animatingWordStrip?.endAnimation(animationState);

    const id = animatingWordStrip.id;
    this.audioManager.beginAudioFadeOut(id);
  }

  hasAnimationCompleted(index) {
    const { animationStatus, animationStartTime, animationDuration } =
      this.animationStateById[index] || {};
    if (animationStatus === AFTER_ANIMATION) return true;
    if (!animationStartTime) return false;

    const timeElapsed = Date.now() - animationStartTime;
    return timeElapsed > animationDuration;
  }

  update() {
    const animatingWordStrip = nth(
      this.wordStrips,
      this.currentlyAnimatingIndex
    );
    if (!animatingWordStrip) return;

    if (this.hasAnimationCompleted(this.currentlyAnimatingIndex)) {
      this.endAnimation(this.currentlyAnimatingIndex);

      this.currentlyAnimatingIndex += 1;
      this.startAnimation(this.currentlyAnimatingIndex);
    }
  }
}
