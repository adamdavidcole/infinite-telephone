import React from "react";
import { RECORD_STATES } from "../utilities/state-manager";

//   export const RECORD_STATES = {
//     RESTING: "RESTING",
//     LISTEN: "LISTEN",
//     PRE_RECORDING: "PRE_RECORDING",
//     RECORDING: "RECORDING",
//     RECORDING_COMPLETE: "RECORDING_COMPLETE",
//   };

export default function RecordPageInstructions({ stateValue }) {
  switch (stateValue) {
    case RECORD_STATES.RESTING:
      return (
        <div>
          Welcome. To join the conversation you will: <br /> 1. Listen to the
          what the previous participant had to share <br /> 2. Take a breath to
          collect your thoughts <br /> 3. Join the conversation by adding your
          response: it can be whatever comes to mind, a direct answer the
          previous message, a thought that passed through your mind while
          listening, whatever! The only requirement is that you please be
          respectful.
        </div>
      );
    case RECORD_STATES.LISTEN:
      return (
        <div>
          Please listen. You will be asked to add your voice to the conversation
          when this message is complete.
        </div>
      );
    case RECORD_STATES.PRE_RECORDING:
      return (
        <div>
          Take a few seconds to collect your thoughts. Your chance to join the
          conversation will begin in a few moments. Please, wait for the tone to
          begin your message.
        </div>
      );
    case RECORD_STATES.RECORDING:
      return <div>Your response is being recorded</div>;
    case RECORD_STATES.RECORDING_COMPLETE:
      return (
        <div>
          You can follow the results of this experiment on instagram by
          following @this.is.not.a.gram
        </div>
      );

    default:
      return null;
  }
}
