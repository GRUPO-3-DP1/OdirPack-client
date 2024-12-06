import { Home, ShowChart, Store } from "@mui/icons-material";
import { MarkerTypes } from "../context/MapMarker/mapMarkerTypes";
import CamionIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/CamionMarker/CamionIcon/CamionIcon";
import AveriaIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/CamionMarker/CamionIcon/AveriaIcon";

export const leyendaItems: { icon: JSX.Element, text: string; name: MarkerTypes; }[] = [
  {
    icon: <CamionIcon size="medium" />,
    text: "Camión",
    name: "camiones"
  },
  {
    icon: <Home sx={{ color: "black" }} fontSize='small' />,
    text: "Almacén",
    name: "almacenes"
  },
  {
    icon: <Store sx={{ color: "green" }} fontSize='small' />,
    text: "Oficina",
    name: "oficinas"
  },
  {
    icon: <AveriaIcon style={{ width: '20px', height: '20px' }} />,
    text: "Camión averiado",
    name: "camionesAveriados"
  },
  {
    icon: <ShowChart sx={{ color: "blue" }} fontSize='small' />,
    text: "Tramo",
    name: "tramos"
  },
  {
    icon: <ShowChart sx={{ color: "red" }} fontSize='small' />,
    text: "Bloqueo",
    name: "tramosBloqueados"
  },
];