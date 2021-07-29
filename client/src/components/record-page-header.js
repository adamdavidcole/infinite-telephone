import React from "react";
import { RECORD_STATES } from "../utilities/state-manager";

//   export const RECORD_STATES = {
//     RESTING: "RESTING",
//     LISTEN: "LISTEN",
//     PRE_RECORDING: "PRE_RECORDING",
//     RECORDING: "RECORDING",
//     RECORDING_COMPLETE: "RECORDING_COMPLETE",
//   };

export default function RecordPageHeader({ stateValue }) {
  switch (stateValue) {
    case RECORD_STATES.RESTING:
    case RECORD_STATES.PRE_RECORDING:
    case RECORD_STATES.RECORDING:
      return <h1>Please Join Our Conversation</h1>;
    case RECORD_STATES.LISTEN:
      return <h1>Sit down one second, I want to tell you everything…</h1>;
    case RECORD_STATES.RECORDING_COMPLETE:
      return <h1>Thank You for Joining Our Conversation</h1>;
    default:
      return <h1>Hello, we are missing a header for {stateValue}</h1>;
  }
}
