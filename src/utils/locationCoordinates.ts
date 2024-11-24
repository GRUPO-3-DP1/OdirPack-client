import oficinas from "../data/oficinas";

export const locationCoordinates: Record<string, { lat: number; lng: number; }> = oficinas.reduce((acc, oficina) => {
  acc[oficina.ubigeo] = { lat: oficina.latitud, lng: oficina.longitud };
  return acc;
}, {} as Record<string, { lat: number; lng: number; }>);