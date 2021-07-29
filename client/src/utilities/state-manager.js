export const RECORD_STATES = {
  RESTING: "RESTING",
  LISTEN: "LISTEN",
  PRE_RECORDING: "PRE_RECORDING",
  RECORDING: "RECORDING",
  RECORDING_COMPLETE: "RECORDING_COMPLETE",
};

export const RECORD_TRANSITIONS = {
  NEXT: "NEXT",
  BACK: "BACK",
  CANCEL: "CANCEL",
};

function createMachine(stateMachineDefinition) {
  const machine = {
    value: stateMachineDefinition.initialState,
    transition(currentState, event) {
      const currentStateDefinition = stateMachineDefinition[currentState];
      const destinationTransition = currentStateDefinition.transitions[event];
      if (!destinationTransition) {
        return;
      }
      const destinationState = destinationTransition.target;
      const destinationStateDefinition =
        stateMachineDefinition[destinationState];
      destinationTransition.action();
      currentStateDefinition.actions.onExit();
      destinationStateDefinition.actions.onEnter();
      machine.value = destinationState;
      return machine.value;
    },
  };
  return machine;
}

const machine = createMachine({
  initialState: RECORD_STATES.RESTING,
  [RECORD_STATES.RESTING]: {
    actions: {
      onEnter() {
        console.log("RESTING: onEnter");
      },
      onExit() {
        console.log("RESTING: onExit");
      },
    },
    transitions: {
      [RECORD_TRANSITIONS.NEXT]: {
        target: RECORD_STATES.LISTEN,
        action() {
          console.log('transition action for "next" in "RESTING" state');
        },
      },
    },
  },
  [RECORD_STATES.LISTEN]: {
    actions: {
      onEnter() {
        console.log("RECORD_STATES: onEnter");
      },
      onExit() {
        console.log("RECORD_STATES: onExit");
      },
    },
    transitions: {
      [RECORD_TRANSITIONS.NEXT]: {
        target: RECORD_STATES.PRE_RECORDING,
        action() {
          console.log('transition action for "next" in "LISTEN" state');
        },
      },
    },
  },
  [RECORD_STATES.PRE_RECORDING]: {
    actions: {
      onEnter() {
        console.log("PRE_RECORDING: onEnter");
      },
      onExit() {
        console.log("PRE_RECORDING: onExit");
      },
    },
    transitions: {
      [RECORD_TRANSITIONS.NEXT]: {
        target: RECORD_STATES.RECORDING,
        action() {
          console.log('transition action for "next" in "PRE_RECORDING" state');
        },
      },
    },
  },
  [RECORD_STATES.RECORDING]: {
    actions: {
      onEnter() {
        console.log("RECORDING: onEnter");
      },
      onExit() {
        console.log("RECORDING: onExit");
      },
    },
    transitions: {
      [RECORD_TRANSITIONS.NEXT]: {
        target: RECORD_STATES.RECORDING_COMPLETE,
        action() {
          console.log('transition action for "next" in "RECORDING" state');
        },
      },
    },
  },
  [RECORD_STATES.RECORDING_COMPLETE]: {
    actions: {
      onEnter() {
        console.log("RECORDING_COMPLETE: onEnter");
      },
      onExit() {
        console.log("RECORDING_COMPLETE: onExit");
      },
    },
    transitions: {
      [RECORD_TRANSITIONS.NEXT]: {
        target: RECORD_STATES.RESTING,
        action() {
          console.log(
            'transition action for "next" in "RECORDING_COMPLETE" state'
          );
        },
      },
    },
  },
});

export default machine;
