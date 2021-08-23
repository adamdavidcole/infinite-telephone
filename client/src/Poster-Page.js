import React, { useEffect, useRef } from "react";

// import P5 from "p5";
// import "p5/lib/addons/p5.sound";

import PosterSketch from "./p5-scripts/poster/poster-sketch";

export default function VisualizationPage() {
  const processingRef = useRef();
  const p5Ref = useRef();

  useEffect(() => {
    p5Ref.current = new window.p5(
      (p) => PosterSketch(p),
      processingRef.current
    );
  }, []);

  return (
    <div className="p-poster_page">
      <div id="app__canvas" ref={processingRef}></div>
    </div>
  );
}
