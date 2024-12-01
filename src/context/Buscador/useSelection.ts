// src/context/useSelection.ts
import { useContext } from 'react';
import { SelectionContext, SelectionContextType } from './SelectionContext';

export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection debe usarse dentro de SelectionProvider');
  }
  return context;
};