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
  let instructionsContent = null;
  switch (stateValue) {
    case RECORD_STATES.RESTING:
      instructionsContent = (
        <div>
          <strong>WELCOME.</strong> To join the conversation please:
          <ol>
            <li>
              Press <strong>START</strong> to listen to the what the last person
              said
            </li>
            <li>
              Take a <i>breath</i> to collect your thoughts
            </li>
            <li>
              Press <strong>BEGIN RECORDING</strong> to join the conversation by
              adding your response. It can be whatever comes to mind: a direct
              answer to the previous message, a thought that passed through your
              mind while listening, anything at all…
            </li>
          </ol>
          The only requirement is that you <strong>please be respectful</strong>
          .
        </div>
      );
      break;
    case RECORD_STATES.LISTEN:
      instructionsContent = (
        <div>
          Please listen. You will be asked to add your voice to the conversation
          when this message is complete.
        </div>
      );
      break;
    case RECORD_STATES.PRE_RECORDING:
      instructionsContent = (
        <div className="p-record_page_instructions__pre_recording">
          Take a few seconds to collect your thoughts. When you are ready to
          join the conversation press <strong>BEGIN RECORDING</strong>.
          <br />
          <br />
          Your response can be up to <em>60 seconds</em> long.
        </div>
      );
      break;
    case RECORD_STATES.RECORDING:
      instructionsContent = (
        <div>
          Your response is being recorded. Click <strong>DONE RECORDING</strong>{" "}
          when your message is complete.
        </div>
      );
      break;
    case RECORD_STATES.RECORDING_COMPLETE:
      instructionsContent = (
        <div>
          You can follow the results of this experiment on instagram by
          following @this.is.not.a.gram
        </div>
      );
      break;

    default:
      return null;
  }

  return (
    <div className="p-record_page_instructions">{instructionsContent}</div>
  );
}
