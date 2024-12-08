import { ShowChart } from "@mui/icons-material";
import { MarkerTypes } from "../context/MapMarker/mapMarkerTypes";
import CamionIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/CamionMarker/Icons/CamionIcon";
import AveriaIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/CamionMarker/Icons/AveriaIcon";
import AlmacenIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/OficinaMarker/Icons/AlmacenIcon";
import OficinaIcon from "../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/OficinaMarker/Icons/OficinaIcon";

export const leyendaItems: { icon: JSX.Element, text: string; name: MarkerTypes; }[] = [
  {
    icon: <CamionIcon size="small" />,
    text: "Camión",
    name: "camiones"
  },
  {
    icon: <AlmacenIcon size="small" />,
    text: "Almacén",
    name: "almacenes"
  },
  {
    icon: <OficinaIcon size="small" mainColor="#000000" />,
    text: "Oficina",
    name: "oficinas"
  },
  {
    icon: <AveriaIcon size="small" />,
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