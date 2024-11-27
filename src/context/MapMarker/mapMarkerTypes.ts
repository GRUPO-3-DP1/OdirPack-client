export type MarkerTypes =
  'camiones' |
  'almacenes' |
  'oficinas' |
  'camionesAveriados' |
  'tramos' |
  'tramosBloqueados';

export type VisibilityState = Record<MarkerTypes, boolean>;

export interface MapMarkersContextType {
  visibility: VisibilityState;
  toggleVisibility: (markerType: MarkerTypes) => void;
  setVisibility: (markerType: MarkerTypes, isVisible: boolean) => void;
}