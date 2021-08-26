import React, { useState } from "react";
import { RECORD_STATES } from "../utilities/state-manager";
import hslToRgb from "../utilities/hsl-to-rgb";
import useInterval from "../utilities/use-interval";

//   export const RECORD_STATES = {
//     RESTING: "RESTING",
//     LISTEN: "LISTEN",
//     PRE_RECORDING: "PRE_RECORDING",
//     RECORDING: "RECORDING",
//     RECORDING_COMPLETE: "RECORDING_COMPLETE",
//   };

export default function RecordPageHeader({ stateValue, shadowRGB }) {
  let headerText = null;

  switch (stateValue) {
    case RECORD_STATES.RESTING:
    case RECORD_STATES.PRE_RECORDING:
    case RECORD_STATES.RECORDING:
    case RECORD_STATES.LISTEN:
      headerText = <h1>Join the Conversation</h1>;
      break;
    // case RECORD_STATES.LISTEN:
    //   headerText = <h1>Sit down one second, I want to tell you everything…</h1>;
    //   break;
    case RECORD_STATES.RECORDING_COMPLETE:
      headerText = <h1>Thank You for Joining the Conversation</h1>;
      break;
    default:
      headerText = <h1>Join the Conversation</h1>;
  }

  const headerStyle = {
    textShadow: `2px 2px ${shadowRGB}`,
  };

  return (
    <div className="p-record_page_header" style={headerStyle}>
      {headerText}
    </div>
  );
}
