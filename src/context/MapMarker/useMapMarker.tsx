import { useContext } from "react";
import { MapMarkersContext } from "./MapMarkerContext";

export const useMapMarker = () => {
  const context = useContext(MapMarkersContext);
  if (context === undefined) {
    throw new Error('useMapMarkers debe usarse dentro de un MapMarkersProvider');
  }
  return context;
};