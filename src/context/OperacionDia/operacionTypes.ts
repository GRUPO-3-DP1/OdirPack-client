import { SimulationState, Vehicle, Bloqueo } from "../Simulacion/simulationTypes";

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
  | { type: 'SET_LAST_PLANIFICATION'; payload: Date }
  | { type: 'UPDATE_VEHICLE_POSITIONS'; payload: Vehicle[] }
  | { type: 'SET_CURRENT_BLOQUEOS'; payload: Bloqueo[] }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] };

export interface OperacionContextType {
  state: OperacionState;
  startOperacion: () => void;
  stopOperacion: () => void;
}
