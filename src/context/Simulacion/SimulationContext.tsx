import React, { createContext, useEffect, useReducer } from "react";
import { initialState, SimulationAction, SimulationState } from "./simulationTypes";

const simulationReducer = (state: SimulationState, action: SimulationAction): SimulationState => {
  switch (action.type) {
    case "START_SIMULATION":
      return {
        ...state,
        isPlaying: true,
        currentTime: action.payload.startTime,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
      };
    case "STOP_SIMULATION":
      return {
        ...state,
        isPlaying: false,
      };
    case "ADVANCE_TIME":
      return {
        ...state,
        currentTime: action.payload,
      };
    default:
      return state;
  }
};

export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const SimulationProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  useEffect(() => {
    let interval = null;
    if (state.isPlaying) {
      interval = setInterval(() => {
        const newTime = new Date(state.currentTime.getTime() + 1000);

        if (newTime >= state.endTime) {
          dispatch({ type: "STOP_SIMULATION" });
        }
        else {
          dispatch({ type: "ADVANCE_TIME", payload: newTime });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, state.currentTime, state.endTime, dispatch]);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
};