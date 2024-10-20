import { Dashboard, DirectionsCar, Inventory, Settings, Warehouse } from "@mui/icons-material";
import React from "react";

type Route = {
  path: string;
  name: string;
  icon: React.ReactNode;
  element: React.ReactNode;
};

const routes: Route[] = [
  {
    path: "/operaciones",
    name: 'Operaciones día a día',
    icon: <Dashboard />,
    element: <div>Operaciones del Día</div>,
  },
  {
    path: '/simulaciones',
    name: 'Simulaciones',
    icon: <DirectionsCar />,
    element: <div>Simulaciones</div>,
  },
  {
    path: '/flota',
    name: 'Flota',
    icon: <DirectionsCar />,
    element: <div>Gestión de Flota</div>,
  },
  {
    path: '/almacenes',
    name: 'Almacenes y oficinas',
    icon: <Warehouse />,
    element: <div>Gestión de Almacenes</div>,
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    icon: <Inventory />,
    element: <div>Gestión de Pedidos</div>,
  },
  {
    path: '/configuracion',
    name: 'Configuración',
    icon: <Settings />,
    element: <div>Configuración</div>,
  },
];

export default routes;