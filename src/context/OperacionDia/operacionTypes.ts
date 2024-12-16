import { SimulationState } from "../Simulacion/simulationTypes";

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
  speed: number;
  simulationTime: Date;
  lastPlanificationTime?: Date | null;

}

export type OperacionAction =
  | { type: 'START_OPERACION'; payload: { initialTime: Date } }
  | { type: 'STOP_OPERACION' }
  | { type: 'UPDATE_TIME'; payload: Date }
  | { type: 'SET_LAST_PLANIFICATION'; payload: Date };

export interface OperacionContextType {
  state: OperacionState;
  startOperacion: () => void;
  stopOperacion: () => void;
}
