import React, { useState } from "react";
import hslToRgb from "../utilities/hsl-to-rgb";
import useInterval from "../utilities/use-interval";

export default function VisualizationPageIntroduction({ onBeginClick }) {
  const [headerShadowHue, setHeaderShadowHue] = useState(0);

  function getRGB() {
    const [r, g, b] = hslToRgb(headerShadowHue / 360, 1, 0.35);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  useInterval(() => {
    setHeaderShadowHue((headerShadowHue + 1) % 360);
  }, 50);

  const headerStyle = {
    textShadow: `2px 2px ${getRGB()}`,
  };

  return (
    <div className="p-visualization__introduction">
      <h1 style={headerStyle}>INFINITE TELEPHONE</h1>
      <p>
        <strong>WELCOME.</strong> Maybe some description of the project,
        purpose, and visualization metaphors go here? Maybe some description of
        the project, purpose, and visualization metaphors go here? Maybe some
        description of the project, purpose, and visualization metaphors go
        here?
      </p>
      <button onClick={onBeginClick}>BEGIN</button>
    </div>
  );
}
