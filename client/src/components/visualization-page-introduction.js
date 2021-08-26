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
        <strong>INFINITE TELEPHONE</strong> is an interactive, public art
        installation that invites the public to join in one endless conversation
        over the course of one day in New York City. Each experience moves this
        unidirectional conversation forward infinitely, and in the process
        connects us all in a multi-person stream of consciousness that elevates
        our thoughts beyond our individual limits.
        <br />
        <br />
        <strong>The following is a map</strong> of that conversation which gives
        a sense of the people's connectedness and shows the way the conversation
        flows, branches, collapses and evolves over time.
      </p>

      <button onClick={onBeginClick}>BEGIN</button>
    </div>
  );
}
