import React, { useEffect, useRef } from "react";
// import P5 from "p5";
// import "p5/lib/addons/p5.sound";

import sketch from "./p5-scripts/visualization-page/sketch.js";

export default function VisualizationPage() {
  const processingRef = useRef();
  const p5Ref = useRef();

  useEffect(() => {
    p5Ref.current = new window.p5(sketch, processingRef.current);
  }, []);

  return (
    <div className="App">
      <div id="app__canvas" ref={processingRef}></div>
    </div>
  );
}
