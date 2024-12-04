import React, { createContext } from 'react';

// Define el contexto vacío
export const OperacionContext = createContext(null);

// Define el proveedor del contexto vacío
export const OperacionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OperacionContext.Provider value={null}>
      {children}
    </OperacionContext.Provider>
  );
};