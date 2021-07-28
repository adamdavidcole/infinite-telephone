import React, { useState, useEffect, useRef } from "react";
import { last } from "lodash";

import AudioRecorder from "./utilities/AudioRecorder";

export default function RecordPage() {
  const [data, setData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioPlayerRef = useRef();
  const audioRecorderRef = useRef(new AudioRecorder({ setIsRecording }));

  // APIs
  const callBackendAPI = async () => {
    const response = await fetch("/get_initial_data");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  async function addDataEntryAPI(dataEntry) {
    const rawResponse = await fetch("/add_data_entry", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataEntry),
    });
    const content = await rawResponse.json();
    console.log("response", content);
  }

  const uploadFileAPI = (blob) => {
    // Create A file
    const timestamp = Date.now();
    const filename = `audio-recording-${timestamp}.ogg`;
    let audioFile = new File([blob], "audioFileName");

    let formdata = new FormData(); //create a from to of data to upload to the server
    formdata.append("recording", audioFile, filename); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

    // Sending Using fetch here you can add your node.js End point
    fetch("/upload_recording", {
      method: "POST",
      body: formdata,
    })
      .then((response) => response.json())
      .then(() => {
        onFileUploadSuccess({ filename, timestamp });
      })
      .catch((error) => console.error("UPLOAD FAILED"));
  };

  // Effects
  useEffect(() => {
    callBackendAPI()
      .then((res) => {
        console.log("res", res);
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    audioRecorderRef.current.initialize();
  }, []);

  // HANDLERS
  function onFileUploadSuccess({ timestamp, filename }) {
    const dataEntry = { timestamp, filename };

    const nextData = [...data];
    nextData.push(dataEntry);
    setData(nextData);

    addDataEntryAPI(dataEntry);
  }

  function playMostRecentAudio() {
    const mostRecentRecording = last(data);
    const mostRecentAudioFilename = mostRecentRecording.filename;
    const audioUrl = `/media/audio/${mostRecentAudioFilename}`;
    var a = new Audio(audioUrl);
    a.onended = stopPlayingAudio;

    audioPlayerRef.current = a;

    a.play();
    setIsPlayingAudio(true);
  }

  function stopPlayingAudio() {
    if (!audioPlayerRef.current) return;

    audioPlayerRef.current.pause();

    setIsPlayingAudio(false);
  }

  function startRecording() {
    if (!audioRecorderRef.current) return;
    audioRecorderRef.current.start();
  }

  function stopRecording() {
    if (!audioRecorderRef.current) return;

    audioRecorderRef.current.stop();

    setTimeout(() => {
      const audioBlob = audioRecorderRef.current.getMostRecentAudioBlob();
      uploadFileAPI(audioBlob);
    }, 1000);
  }

  // RENDERING
  return (
    <div>
      <h1>Prepare to record!</h1>
      {/* <audio controls autoPlay>
        <source src="/media/audio/002.m4a" />
      </audio> */}
      <div>
        {isPlayingAudio ? (
          <button type="button" onClick={stopPlayingAudio}>
            Stop playing audio
          </button>
        ) : (
          <button type="button" onClick={playMostRecentAudio}>
            Play most recent audio
          </button>
        )}
        {isRecording ? (
          <button type="button" onClick={stopRecording}>
            Stop recording
          </button>
        ) : (
          <button type="button" onClick={startRecording}>
            Record audio
          </button>
        )}
      </div>
      <br />
      {JSON.stringify(data)}
    </div>
  );
}
