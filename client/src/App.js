import React, { useState, useEffect, useRef, useCallback } from "react";
import stem from "wink-porter2-stemmer";
import p5 from "p5";
// import p5 from 'p5';
import "p5/lib/addons/p5.sound";
// import "p5/lib/addons/p5.dom";
// import "p5/lib/addons/p5.sound";

// import P5Wrapper from "react-p5-wrapper";

import sketch from "./p5-scripts/sketch";

import AudioRecorder from "./utilities/AudioRecorder";
import AudioTranscription from "./utilities/AudioTranscription";

import "./App.css";

function App() {
  const processingRef = useRef();
  const p5Ref = useRef();

  const [data, setData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processedWords, setProcessedWords] = useState({});

  const currWords = useRef(processedWords);

  const callBackendAPI = async () => {
    const response = await fetch("/express_backend");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  const processTranscriptionResult = useCallback(({ resultText }) => {
    if (!resultText) return;

    setProcessedWords((prevProcessedWords) => {
      const nextProcessedWords = { ...prevProcessedWords };

      const words = resultText.toLowerCase().split(" ");

      words.forEach((word) => {
        const wordStem = stem(word);
        const nextProcessedWordCount = nextProcessedWords[wordStem] || 0;
        nextProcessedWords[wordStem] = nextProcessedWordCount + 1;
      });

      currWords.current = nextProcessedWords;

      return nextProcessedWords;
    });
  }, []);

  const audioRecorderRef = useRef(new AudioRecorder({ setIsRecording }));
  const audioTranscription = useRef(
    new AudioTranscription({
      onTranscriptionResult: processTranscriptionResult,
    })
  );

  useEffect(() => {
    audioRecorderRef.current.initialize();
    audioTranscription.current.initialize();
  }, []);

  useEffect(() => {
    callBackendAPI()
      .then((res) => setData(res.express))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    p5Ref.current = new p5(sketch, processingRef.current);
  }, []);

  // useEffect(() => {
  //   if (processingRef.current) {
  //     let xPos = 0;
  //     let interval = setInterval(() => {
  //       processingRef.current.scroll({
  //         top: 0,
  //         left: xPos,
  //         behavior: "auto",
  //       });
  //       xPos += 1;
  //     }, 80);
  //   }
  // }, [processingRef]);

  function startRecording() {
    audioRecorderRef.current.start();
    audioTranscription.current.start();
  }

  function stopRecording() {
    audioRecorderRef.current.stop();
    audioTranscription.current.stop();
  }

  return (
    <div className="App">
      <div id="app__canvas" ref={processingRef}></div>
      {/* <header className="App-header">
        <div id="app__canvas" ref={processingRef}></div>
        <br />
        {isRecording ? (
          <button onClick={stopRecording}>Stop recording</button>
        ) : (
          <button onClick={startRecording}>Start recording</button>
        )}
        <div>
          <br />
          <b>Processed word counts</b>
          <br />
          {JSON.stringify(processedWords, null, 2)}
        </div>
      </header>
      <p className="App-intro">{data}</p> */}
    </div>
  );
}

export default App;
