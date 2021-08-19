import React, { useEffect, useRef, useCallback, useState } from "react";
import testAudioData from "./data/audio-data.json";
import { getInitialDataAPI } from "./fetchers/fetchers";

// import P5 from "p5";
// import "p5/lib/addons/p5.sound";

import sketch from "./p5-scripts/visualization-page/sketch.js";

export default function VisualizationPage() {
  const [data, setData] = useState(null);
  const processingRef = useRef();
  const p5Ref = useRef();

  const urlParams = new URLSearchParams(window.location.search);
  const useTestAudio = urlParams.get("useTestAudio");

  console.log("useTestAudio", useTestAudio);

  useEffect(() => {
    if (useTestAudio) {
      setData(testAudioData);
    } else {
      return getInitialDataAPI().then((res) => {
        const data = res.data;
        console.log(
          "Visualization-Page: fetched initial data with length: ",
          data
        );

        setData(data);
      });
    }
  }, [useTestAudio]);

  useEffect(() => {
    if (!data) return;

    p5Ref.current = new window.p5(
      (p) => sketch(p, { audioData: data, useTestAudio }),
      processingRef.current
    );
  }, [data, useTestAudio]);

  return (
    <div className="App">
      <div id="app__canvas" ref={processingRef}></div>
    </div>
  );
}
