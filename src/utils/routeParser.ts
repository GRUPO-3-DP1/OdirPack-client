import oficinas from "../data/oficinas";

// Definimos las interfaces
interface Oficina {
  ubigeo: string;
  departamento: string;
  provincia: string;
  latitud: number;
  longitud: number;
  regionNatural: string;
  almacen: number;
}

interface Coordenada {
  lat: number;
  lng: number;
}

interface Location {
  id: string;
  coords: Coordenada;
}

interface Tramo {
  from: Location;
  to: Location;
}

export interface TramoMap {
  [key: string]: {
    coords: Coordenada;
    connections: Array<{
      id: string;
      coords: Coordenada;
    }>;
  };
}

// Función para encontrar las coordenadas de un ubigeo
function findCoordinates(ubigeo: string, oficinas: Oficina[]): Coordenada | null {
  const oficina = oficinas.find(o => o.ubigeo === ubigeo);
  if (!oficina) return null;
  return {
    lat: oficina.latitud,
    lng: oficina.longitud
  };
}

// Función para parsear el texto a tramos con coordenadas
export function parseTramos(routeText: string, oficinas: Oficina[]): Tramo[] {
  return routeText
    .trim()
    .split('\n')
    .map(line => {
      const [from, to] = line.split('=>').map(s => s.trim());
      const fromCoords = findCoordinates(from, oficinas);
      const toCoords = findCoordinates(to, oficinas);

      if (!fromCoords || !toCoords) {
        throw new Error(`No se encontraron coordenadas para ubigeo ${!fromCoords ? from : to}`);
      }

      return {
        from: {
          id: from,
          coords: fromCoords
        },
        to: {
          id: to,
          coords: toCoords
        }
      };
    });
}

export function createTramoMap(tramos: Tramo[]): TramoMap {
  const tramoMap: TramoMap = {};

  tramos.forEach(tramo => {
    // Función auxiliar para agregar una conexión solo si no existe
    const addConnection = (from: string, to: Location) => {
      if (!tramoMap[from]) {
        tramoMap[from] = { coords: findCoordinates(from, oficinas)!, connections: [] };
      }
      if (!tramoMap[from].connections.some(c => c.id === to.id)) { // Verificar si ya existe la conexión
        tramoMap[from].connections.push({ id: to.id, coords: to.coords });
      }
    };

    addConnection(tramo.from.id, tramo.to);
    addConnection(tramo.to.id, tramo.from);
  });

  return tramoMap;
}