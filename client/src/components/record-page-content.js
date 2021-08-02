import React, { useState, useEffect, useCallback } from "react";
import useInterval from "../utilities/use-interval";
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
    setTimeout(playMostRecentAudio, 100);
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

function ListenContent({}) {
  return <div>Listening in progress...</div>;
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
  const [countdown, setCountdown] = useState(65);

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

  return (
    <>
      <div>
        Recording time remaining: <strong>{countdown} seconds</strong>
      </div>
      <button onClick={onDoneClicked}>Done recording</button>
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
      recordPageContent = <ListenContent />;
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
