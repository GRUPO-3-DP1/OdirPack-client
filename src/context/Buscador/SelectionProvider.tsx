// src/context/SelectionProvider.tsx
import React, { useState } from 'react';
import { SelectionContext, SelectionContextType } from './SelectionContext';
import { Oficina, Vehicle, Order } from '../Simulacion/simulationTypes';

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);
  const [selectedCamion, setSelectedCamion] = useState<Vehicle | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<Order | null>(null);

  const contextValue: SelectionContextType = {
    selectedOficina,
    setSelectedOficina,
    selectedCamion,
    setSelectedCamion,
    selectedPedido,
    setSelectedPedido,
  };

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
};