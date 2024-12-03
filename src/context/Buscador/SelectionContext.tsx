// src/context/SelectionContext.tsx
import { createContext } from 'react';
import { Oficina, Vehicle as Camion, Order as Pedido } from '../Simulacion/simulationTypes';

export interface SelectionContextType {
  selectedOficina: Oficina | null;
  setSelectedOficina: React.Dispatch<React.SetStateAction<Oficina | null>>;
  selectedCamion: Camion | null;
  setSelectedCamion: React.Dispatch<React.SetStateAction<Camion | null>>;
  selectedPedido: Pedido | null;
  setSelectedPedido: React.Dispatch<React.SetStateAction<Pedido | null>>;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined);