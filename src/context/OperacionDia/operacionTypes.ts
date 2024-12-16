import { Vehicle, Oficina, Bloqueo, SimulationState } from '../Simulacion/simulationTypes';

export interface OperacionState extends Omit<SimulationState, 
  'ends' | 
  'colapso' | 
  'endTime' | 
  'simulationHistory' | 
  'executionStartTime' | 
  'executionEndTime' |
  'operationType'
> {
  isActive: boolean;
  lastPlanificationTime: Date | null;
  nextPlanificationTime: Date | null;
  isTestMode: boolean;
  speed: number;
  simulationTime: Date;
  realTime: Date;
}

export type OperacionAction = 
  | { type: 'START_OPERACION' }
  | { type: 'STOP_OPERACION' }
  | { type: 'UPDATE_VEHICLES'; payload: Vehicle[] }
  | { type: 'UPDATE_CURRENT_TIME'; payload: Date }
  | { type: 'SET_NEXT_PLANIFICATION'; payload: Date }
  | { type: 'SET_LAST_PLANIFICATION'; payload: Date }
  | { type: 'TOGGLE_TEST_MODE' }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'SET_CURRENT_BLOQUEOS'; payload: Bloqueo[] }
  | { type: 'SET_OFFICES'; payload: Oficina[] }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'UPDATE_TIMES'; payload: { realTime: Date; simulationTime: Date } };

export interface OperacionContextType {
  state: OperacionState;
  startOperacion: () => Promise<void>;
  stopOperacion: () => void;
  toggleTestMode: () => void;
  setPlanificationInterval: (minutes: number) => void;
}