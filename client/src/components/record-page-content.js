import React, { useState, useEffect, useCallback, useRef } from "react";
// import * as P5 from "p5";
// import "p5/lib/addons/p5.sound";

// window.p5 = P5; // I need this otherwise it throws an error
// eslint-disable import/first

import audioVisualizerSketch from "../p5-scripts/record-page/audio-visualizer-sketch.js";
import recorderVisualizerSketch from "../p5-scripts/record-page/recorder-visualizer-sketch";
import useInterval from "../utilities/use-interval";
import lerpColor from "../utilities/lerp-color";
import isMobile from "../utilities/is-mobile";
import { RECORD_STATES } from "../utilities/state-manager";

//   export const RECORD_STATES = {
//     RESTING: "RESTING",
//     LISTEN: "LISTEN",
//     PRE_RECORDING: "PRE_RECORDING",
//     RECORDING: "RECORDING",
//     RECORDING_COMPLETE: "RECORDING_COMPLETE",
//   };

function RestingContent({
  playMostRecentAudio,
  transitionToNextState,
  shadowRGB,
  fetchAppData,
}) {
  function onBeginClick() {
    fetchAppData().then(() => {
      transitionToNextState();
    });
  }

  const buttonStyle = {
    boxShadow: `0 0 30px ${shadowRGB}`,
    // background: shadowRGB,
  };

  return (
    <button type="button" onClick={onBeginClick}>
      Begin
    </button>
  );
}

function ListenContent({ audioFilenameAsMp3, transitionToNextState }) {
  const processingRef = useRef();
  const sketchRef = useRef();

  const onAudioEnded = useCallback(() => {
    if (sketchRef.current) sketchRef.current.cleanup();
    transitionToNextState();
  }, [transitionToNextState]);

  useEffect(() => {
    if (!audioFilenameAsMp3) {
      onAudioEnded();
      return;
    }

    sketchRef.current = new window.p5(
      (p) =>
        audioVisualizerSketch(p, {
          audioFilenameAsMp3,
          onAudioEnded,
          height: processingRef.current.clientHeight,
        }),
      processingRef.current
    );
  }, [audioFilenameAsMp3]);

  return (
    <div id="p_record_page_listen_content__canvas" ref={processingRef}></div>
  );
}

function PreRecordingContent({ transitionToNextState }) {
  const onDoneClicked = useCallback(() => {
    transitionToNextState();
  }, [transitionToNextState]);

  return (
    <div>
      <button onClick={onDoneClicked}>Begin recording</button>
    </div>
  );
}

function RecordingContent({
  startRecording,
  stopRecording,
  transitionToNextState,
}) {
  const recordingDuration = 60;
  const processingRef = useRef();
  const sketchRef = useRef();
  const [countdown, setCountdown] = useState(recordingDuration);

  useInterval(() => {
    if (countdown > 0) {
      setCountdown(countdown - 1);
    }
  }, 1000);

  useEffect(() => {
    startRecording();
  }, [startRecording]);

  const onRecordingComplete = useCallback(() => {
    sketchRef.current?.cleanup();
    stopRecording();
    transitionToNextState();
  }, [stopRecording, transitionToNextState]);

  useEffect(() => {
    if (countdown === 0) {
      onRecordingComplete();
    }
  }, [countdown, onRecordingComplete]);

  function onDoneClicked() {
    onRecordingComplete();
  }

  useEffect(() => {
    if (!processingRef.current) return;
    if (isMobile()) return;

    const height = processingRef.current.clientHeight;

    sketchRef.current = new window.p5(
      (p) =>
        recorderVisualizerSketch(p, {
          useMicAsSource: true,
          height,
        }),
      processingRef.current
    );
  }, []);

  const progressDecimal = (recordingDuration - countdown) / recordingDuration;
  const progressPercentage = progressDecimal * 100;

  const lerpColorStart = "#2cba00";
  const lerpColorMid = "#fff400";
  const lerpColorEnd = "#ff0000";

  let lerpedColor;
  if (progressDecimal < 0.5) {
    lerpedColor = lerpColor(lerpColorStart, lerpColorMid, progressDecimal * 2);
  } else {
    lerpedColor = lerpColor(
      lerpColorMid,
      lerpColorEnd,
      (progressDecimal - 0.5) * 2
    );
  }

  return (
    <>
      <button
        className="p_recording_content__done_recording"
        onClick={onDoneClicked}
      >
        <div
          className="p_recording_content__done_recording_progress"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: lerpedColor,
          }}
        ></div>
        <div className="p_recording_content__done_recording_text">
          DONE RECORDING
        </div>
      </button>
      <div className="p_recording_content__actions_countdown">
        {countdown}s remaining…
      </div>
      <div id="p_record_page_listen_content__canvas" ref={processingRef}></div>
    </>
  );
}

function RecordingCompleteContent({ transitionToNextState }) {
  const [countdown, setCountdown] = useState(60);

  useInterval(() => {
    if (countdown > 0) {
      setCountdown(countdown - 1);
    }
  }, 1000);

  useEffect(() => {
    if (countdown === 0) {
      transitionToNextState();
    }
  }, [countdown, transitionToNextState]);

  const onDoneClicked = useCallback(() => {
    transitionToNextState();
  }, [transitionToNextState]);

  return (
    <div>
      <button onClick={onDoneClicked}>Finished</button>
    </div>
  );
}

export default function RecordPageContent({
  stateValue,
  playMostRecentAudio,
  startRecording,
  stopRecording,
  transitionToNextState,
  audioFilenameAsMp3,
  onAudioEnded,
  shadowRGB,
  fetchAppData,
}) {
  let recordPageContent = null;

  switch (stateValue) {
    case RECORD_STATES.RESTING:
      recordPageContent = (
        <RestingContent
          playMostRecentAudio={playMostRecentAudio}
          transitionToNextState={transitionToNextState}
          shadowRGB={shadowRGB}
          fetchAppData={fetchAppData}
        />
      );
      break;

    case RECORD_STATES.LISTEN:
      recordPageContent = (
        <ListenContent
          audioFilenameAsMp3={audioFilenameAsMp3}
          onAudioEnded={onAudioEnded}
          transitionToNextState={transitionToNextState}
        />
      );
      break;

    case RECORD_STATES.PRE_RECORDING:
      recordPageContent = (
        <PreRecordingContent transitionToNextState={transitionToNextState} />
      );
      break;

    case RECORD_STATES.RECORDING:
      recordPageContent = (
        <RecordingContent
          startRecording={startRecording}
          stopRecording={stopRecording}
          transitionToNextState={transitionToNextState}
        />
      );
      break;

    case RECORD_STATES.RECORDING_COMPLETE:
      recordPageContent = (
        <RecordingCompleteContent
          transitionToNextState={transitionToNextState}
          fetchAppData={fetchAppData}
        />
      );
      break;

    default:
      return null;
  }

  return <div className="p-record_page_content">{recordPageContent}</div>;
}
