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

const AUDIO_FILE_TYPES = {
  webm: "audio/webm;codecs=opus",
  ogg: "audio/ogg;codecs=opus",
  mp3: "audio/mpeg",
};

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

  const fetchAppData = useCallback(() => {
    return getInitialDataAPI()
      .then((res) => {
        console.log("Initial data:", res);
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // Effects
  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  useEffect(() => {
    audioRecorderRef.current.initialize();
  }, []);

  // HANDLERS
  const onFileUploadSuccess = useCallback(
    ({ timestamp, filename }) => {
      const dataEntry = { timestamp, filename, id: timestamp };

      addDataEntryAPI(dataEntry).then((dataEntry) => {
        const nextData = data ? [...data] : [];
        nextData.push(dataEntry);
        setData(nextData);
        console.log("Updated data store with ", dataEntry);
      });
    },
    [data]
  );

  function getMostRecentAudioFile() {
    const mostRecentRecording = last(data);
    const mostRecentAudioFilename = mostRecentRecording?.processedFilename;

    return mostRecentAudioFilename;
  }

  const onAudioEnded = useCallback((callback) => {
    transitionToNextState();
    setIsPlayingAudio(false);
    // if (callback) callback();
  }, []);

  // MAYBE DELETE
  function playMostRecentAudio() {
    const mostRecentAudioFilename = getMostRecentAudioFile();
    if (!mostRecentAudioFilename || !audioRef.current) {
      transitionToNextState();
      return;
    }

    console.log("playMostRecentAudio", mostRecentAudioFilename);
    console.log("audioRef.current", audioRef.current);

    audioRef.current.onended = stopPlayingAudio;
    audioRef.current.play();

    setIsPlayingAudio(true);
  }

  // MAYBE DELETE
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
      const fileExtension = audioRecorderRef.current.getFileExtension();

      const timestamp = Date.now();
      const filename = `audio-recording-${timestamp}.${fileExtension}`;

      console.log(`Uploading ${filename}`);
      uploadFileAPI({ blob, filename })
        .then(() => {
          console.log(`Uploading ${filename} SUCCESS`);
          onFileUploadSuccess({ filename, timestamp });
        })
        .catch((e) => {
          console.log(`Uploading ${filename} FAILED`, e);
        });
    }, 1000);
  }, [onFileUploadSuccess]);

  const audioFilename = getMostRecentAudioFile();
  // TODO: fix
  const audioFilenameAsMp3 = audioFilename;

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
        onAudioEnded={onAudioEnded}
        audioFilenameAsMp3={audioFilenameAsMp3}
        shadowRGB={getRGB()}
        fetchAppData={fetchAppData}
      />

      {audioFilenameAsMp3 && (
        <audio
          controls
          className="p-record_page__hidden_audio"
          ref={audioRef}
          preload="auto"
          src={audioFilenameAsMp3}
        ></audio>
      )}
    </div>
  );
}
