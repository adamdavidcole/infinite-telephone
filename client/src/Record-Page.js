import React, { useState, useEffect, useRef, useCallback } from "react";
import { last } from "lodash";

import {
  getInitialDataAPI,
  addDataEntryAPI,
  uploadFileAPI,
} from "./fetchers/fetchers";
import hslToRgb from "./utilities/hsl-to-rgb";
import useInterval from "./utilities/use-interval";
import AudioRecorder from "./utilities/AudioRecorder";
import stateManager, { RECORD_TRANSITIONS } from "./utilities/state-manager";

import RecordPageHeader from "./components/record-page-header";
import RecordPageInstructions from "./components/record-page-instructions";
import RecordPageContent from "./components/record-page-content";

export default function RecordPage() {
  const [currentState, setCurrentState] = useState(stateManager.value);
  const [data, setData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef();
  const [headerShadowHue, setHeaderShadowHue] = useState(0);

  const audioRecorderRef = useRef(new AudioRecorder({ setIsRecording }));

  function transitionToNextState() {
    stateManager.transition(stateManager.value, RECORD_TRANSITIONS.NEXT);
    setCurrentState(stateManager.value);
  }

  useInterval(() => {
    setHeaderShadowHue((headerShadowHue + 1) % 360);
  }, 50);

  function getRGB() {
    const [r, g, b] = hslToRgb(headerShadowHue / 360, 1, 0.5);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // Effects
  useEffect(() => {
    getInitialDataAPI()
      .then((res) => {
        console.log("Initial data:", res);
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    audioRecorderRef.current.initialize();
  }, []);

  // HANDLERS
  const onFileUploadSuccess = useCallback(
    ({ timestamp, filename }) => {
      const dataEntry = { timestamp, filename };

      const nextData = [...data];
      nextData.push(dataEntry);
      setData(nextData);

      addDataEntryAPI(dataEntry);
    },
    [data]
  );

  function getMostRecentAudioFile() {
    const mostRecentRecording = last(data);
    const mostRecentAudioFilename = mostRecentRecording?.filename;

    return mostRecentAudioFilename;
  }

  function playMostRecentAudio() {
    const mostRecentAudioFilename = getMostRecentAudioFile();
    if (!mostRecentAudioFilename || !audioRef.current) {
      transitionToNextState();
    }

    console.log("playMostRecentAudio", mostRecentAudioFilename);
    console.log("audioRef.current", audioRef.current);

    audioRef.current.onended = stopPlayingAudio;
    audioRef.current.play();

    setIsPlayingAudio(true);
  }

  function stopPlayingAudio() {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlayingAudio(false);

    transitionToNextState();
  }

  const startRecording = useCallback(() => {
    if (!audioRecorderRef.current) return;
    audioRecorderRef.current.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (!audioRecorderRef.current) return;

    audioRecorderRef.current.stop();

    setTimeout(() => {
      const blob = audioRecorderRef.current.getMostRecentAudioBlob();

      const timestamp = Date.now();
      const filename = `audio-recording-${timestamp}.ogg`;

      uploadFileAPI({ blob, filename }).then(() => {
        onFileUploadSuccess({ filename, timestamp });
      });
    }, 1000);
  }, [onFileUploadSuccess]);

  return (
    <div className="p-record_page">
      <RecordPageHeader stateValue={currentState} shadowRGB={getRGB()} />
      <RecordPageInstructions stateValue={currentState} />
      <RecordPageContent
        stateValue={stateManager.value}
        playMostRecentAudio={playMostRecentAudio}
        transitionToNextState={transitionToNextState}
        startRecording={startRecording}
        stopRecording={stopRecording}
        shadowRGB={getRGB()}
      />
      <button onClick={() => console.log("fake click")}>Fake button</button>
      <audio
        className="p-record_page__hidden_audio"
        const
        ref={audioRef}
        src={getMostRecentAudioFile()}
        controls
        preload="none"
      />
    </div>
  );
}
