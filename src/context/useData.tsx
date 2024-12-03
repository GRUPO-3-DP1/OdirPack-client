import { useContext } from 'react';
import { SimulationContext } from './Simulacion/SimulationContext';
//import { OperacionContext } from './OperacionDia/OperacionContext';

export const useData = () => {
  const simulationContext = useContext(SimulationContext);
  const operacionContext = null; // useContext(OperacionContext);

  if (simulationContext) {
    return simulationContext;
  } else if (operacionContext) {
    return operacionContext;
  } else {
    throw new Error('useData debe usarse dentro de SimulationProvider o OperacionProvider');
  }
};
