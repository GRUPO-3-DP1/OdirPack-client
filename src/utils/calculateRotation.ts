/**
 * Calcula la rotación en grados para que el icono apunte desde el origen hacia el destino.
 * El icono por defecto apunta al sur (0°).
 * 
 * @param origin - Coordenadas del punto de origen { lat: number, lng: number }
 * @param destination - Coordenadas del punto de destino { lat: number, lng: number }
 * @returns Rotación en grados (0° apunta al sur, 90° al este, 180° al norte, 270° al oeste)
 */
export function calculateRotation(origin: { lat: number; lng: number; }, destination: { lat: number; lng: number; }): number {
  const deltaLng = destination.lng - origin.lng;
  const deltaLat = destination.lat - origin.lat;

  const angleRadians = Math.atan2(deltaLng, deltaLat);

  let angleDegrees = (angleRadians * 180) / Math.PI;

  angleDegrees = (angleDegrees + 180) % 360;

  return angleDegrees;
}
