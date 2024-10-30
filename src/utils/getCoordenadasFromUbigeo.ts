import oficinas from "../data/oficinas";

export function getCoordenadas(ubigeo: string): { lat: number, lng: number; } | null {
  const oficina = oficinas.find(o => o.ubigeo === ubigeo);
  if (oficina) {
    return { lat: oficina.latitud, lng: oficina.longitud };
  }
  return null;
}