function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function interpolatePosition(start: { lat: number; lng: number; }, end: { lat: number; lng: number; }, progress: number) {
  const R = 6371;

  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lng);

  const d = 2 * R * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    )
  );

  const A = Math.sin((1 - progress) * d / R) / Math.sin(d / R);
  const B = Math.sin(progress * d / R) / Math.sin(d / R);

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);

  return {
    lat: lat * 180 / Math.PI,
    lng: lon * 180 / Math.PI
  };
}