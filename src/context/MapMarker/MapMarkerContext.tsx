import { createContext, useState } from "react";
import { initialVisibilityState, MapMarkersContextType, MarkerTypes, VisibilityState } from "./mapMarkerTypes";

export const MapMarkersContext = createContext<MapMarkersContextType | undefined>(undefined);

export const MapMarkersProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [visibility, setVisibilityState] = useState<VisibilityState>(initialVisibilityState);

  // Función para alternar la visibilidad de un tipo de marcador
  const toggleVisibility = (markerType: MarkerTypes) => {
    setVisibilityState(prevVisibility => ({
      ...prevVisibility,
      [markerType]: !prevVisibility[markerType],
    }));
  };

  // Función para establecer visibilidad específica de un tipo de marcador
  const setVisibility = (markerType: MarkerTypes, isVisible: boolean) => {
    setVisibilityState(prevVisibility => ({
      ...prevVisibility,
      [markerType]: isVisible,
    }));
  };

  // Proveer el estado y las funciones al contexto
  return (
    <MapMarkersContext.Provider value={{ visibility, toggleVisibility, setVisibility }}>
      {children}
    </MapMarkersContext.Provider>
  );
};