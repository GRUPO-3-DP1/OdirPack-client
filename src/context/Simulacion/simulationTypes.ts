export type SimulationState = {
  isPlaying: boolean;
  currentTime: Date;
  startTime: Date;
  endTime: Date;
};

export type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { startTime: Date; endTime: Date; }; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'ADVANCE_TIME'; payload: Date; };

export const initialState: SimulationState = {
  isPlaying: false,
  currentTime: new Date(),
  startTime: new Date(),
  endTime: new Date(),
};