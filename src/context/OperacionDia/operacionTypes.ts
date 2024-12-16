import { Vehicle, Oficina, Bloqueo } from '../Simulacion/simulationTypes';

export interface OperacionState {
  isActive: boolean;
  currentTime: Date;
  vehicles: Vehicle[];
  offices: Oficina[];
  bloqueos: Bloqueo[];
  lastPlanificationTime: Date | null;
  nextPlanificationTime: Date | null;
  isTestMode: boolean;
}

export type OperacionAction = 
  | { type: 'START_OPERACION' }
  | { type: 'STOP_OPERACION' }
  | { type: 'UPDATE_VEHICLES'; payload: Vehicle[] }
  | { type: 'UPDATE_CURRENT_TIME'; payload: Date }
  | { type: 'SET_NEXT_PLANIFICATION'; payload: Date }
  | { type: 'SET_LAST_PLANIFICATION'; payload: Date }
  | { type: 'TOGGLE_TEST_MODE' };

export interface OperacionContextType {
  state: OperacionState;
  startOperacion: () => Promise<void>;
  stopOperacion: () => void;
  toggleTestMode: () => void;
}