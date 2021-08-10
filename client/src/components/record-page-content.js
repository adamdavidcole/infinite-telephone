import React, { useState, useEffect, useCallback, useRef } from "react";
import p5 from "p5";
import "p5/lib/addons/p5.sound";

import audioVisualizerSketch from "../p5-scripts/audio-visualizer-sketch";
import useInterval from "../utilities/use-interval";
import lerpColor from "../utilities/lerp-color";
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
}) {
  function onBeginClick() {
    transitionToNextState();
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

function ListenContent({ audioFilenameAsMp3, onAudioEnded }) {
  const processingRef = useRef();

  useEffect(() => {
    new p5(
      (p) =>
        audioVisualizerSketch(p, {
          audioFilenameAsMp3,
          onAudioEnded,
          height: processingRef.current.clientHeight,
        }),
      processingRef.current
    );
  }, [audioFilenameAsMp3, onAudioEnded]);

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
  const recordingDuration = 30;
  const processingRef = useRef();
  const [countdown, setCountdown] = useState(recordingDuration);

  useInterval(() => {
    if (countdown > 0) {
      setCountdown(countdown - 1);
    }
  }, 1000);

  useEffect(() => {
    startRecording();
  }, [startRecording]);

  useEffect(() => {
    if (countdown === 0) {
      stopRecording();
      transitionToNextState();
    }
  }, [countdown, stopRecording, transitionToNextState]);

  function onDoneClicked() {
    stopRecording();
    transitionToNextState();
  }

  useEffect(() => {
    if (!processingRef.current) return;

    const height = processingRef.current.clientHeight;

    new p5(
      (p) =>
        audioVisualizerSketch(p, {
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
}) {
  let recordPageContent = null;

  switch (stateValue) {
    case RECORD_STATES.RESTING:
      recordPageContent = (
        <RestingContent
          playMostRecentAudio={playMostRecentAudio}
          transitionToNextState={transitionToNextState}
          shadowRGB={shadowRGB}
        />
      );
      break;

    case RECORD_STATES.LISTEN:
      recordPageContent = (
        <ListenContent
          audioFilenameAsMp3={audioFilenameAsMp3}
          onAudioEnded={onAudioEnded}
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
        />
      );
      break;

    default:
      return null;
  }

  return <div className="p-record_page_content">{recordPageContent}</div>;
}
