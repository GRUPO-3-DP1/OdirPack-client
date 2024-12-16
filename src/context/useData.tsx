import { useContext } from 'react';
import { SimulationContext } from './Simulacion/SimulationContext';
import { OperacionContext } from './OperacionDia/OperacionContext';

// Hook específico para operaciones
export const useOperacionData = () => {
  const context = useContext(OperacionContext);
  if (!context) {
    throw new Error('useOperacionData debe usarse dentro de OperacionProvider');
  }
  return context;
};

// Hook general de useData que usa simulación, para que no se caiga simulación
export const useData = () => {
  const simulationContext = useContext(SimulationContext);
  if (!simulationContext) {
    throw new Error('useData debe usarse dentro de SimulationProvider');
  }
  return simulationContext;
};
