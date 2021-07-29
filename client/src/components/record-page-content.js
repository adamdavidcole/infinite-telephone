import React, { useState, useEffect, useRef } from "react";
import { RECORD_STATES } from "../utilities/state-manager";

//   export const RECORD_STATES = {
//     RESTING: "RESTING",
//     LISTEN: "LISTEN",
//     PRE_RECORDING: "PRE_RECORDING",
//     RECORDING: "RECORDING",
//     RECORDING_COMPLETE: "RECORDING_COMPLETE",
//   };

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

function RestingContent({ playMostRecentAudio, transitionToNextState }) {
  function onBeginClick() {
    playMostRecentAudio();
    transitionToNextState();
  }

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
  const [countdown, setCountdown] = useState(5);

  useInterval(() => {
    if (countdown > 0) {
      setCountdown(countdown - 1);
    }
  }, 1000);

  useEffect(() => {
    if (countdown === 0) transitionToNextState();
  }, [countdown, transitionToNextState]);

  return <div>Recording will begin in {countdown} seconds</div>;
}

function RecordingContent({
  startRecording,
  stopRecording,
  transitionToNextState,
}) {
  const [countdown, setCountdown] = useState(4);

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
    <div>
      <span>
        Recording time remaining: <strong>{countdown} seconds</strong>
      </span>
      <button onClick={onDoneClicked}>Done recording</button>
    </div>
  );
}

function RecordingCompleteContent({ transitionToNextState }) {
  const [countdown, setCountdown] = useState(10);

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

  return (
    <div>
      Session will end in <strong>{countdown} seconds</strong>
    </div>
  );
}

export default function RecordPageContent({
  stateValue,
  playMostRecentAudio,
  startRecording,
  stopRecording,
  transitionToNextState,
}) {
  switch (stateValue) {
    case RECORD_STATES.RESTING:
      return (
        <RestingContent
          playMostRecentAudio={playMostRecentAudio}
          transitionToNextState={transitionToNextState}
        />
      );

    case RECORD_STATES.LISTEN:
      return <ListenContent />;

    case RECORD_STATES.PRE_RECORDING:
      return (
        <PreRecordingContent transitionToNextState={transitionToNextState} />
      );

    case RECORD_STATES.RECORDING:
      return (
        <RecordingContent
          startRecording={startRecording}
          stopRecording={stopRecording}
          transitionToNextState={transitionToNextState}
        />
      );

    case RECORD_STATES.RECORDING_COMPLETE:
      return (
        <RecordingCompleteContent
          transitionToNextState={transitionToNextState}
        />
      );

    default:
      return null;
  }
}
