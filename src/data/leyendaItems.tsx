import { BuildCircle, Home, LocalShipping, ShowChart, Store } from "@mui/icons-material";
import { MarkerTypes } from "../context/MapMarker/mapMarkerTypes";

export const leyendaItems: { icon: JSX.Element, text: string; name: MarkerTypes; }[] = [
  {
    icon: <LocalShipping sx={{ color: "blue" }} fontSize='small' />,
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
    icon: <BuildCircle sx={{ color: "red" }} fontSize='small' />,
    text: "Camión averiado",
    name: "camionesAveriados"
  },
  {
    icon: <ShowChart sx={{ color: "grey" }} fontSize='small' />,
    text: "Tramo",
    name: "tramos"
  },
  {
    icon: <ShowChart sx={{ color: "red" }} fontSize='small' />,
    text: "Bloqueo",
    name: "tramosBloqueados"
  },
];