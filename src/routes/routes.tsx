import { Dashboard, DirectionsCar, Inventory, Settings, Warehouse } from "@mui/icons-material";
import Operaciones from '../pages/OperacionesDiaDia/Page';
import Simulaciones from '../pages/Simulaciones/Page';
import Flota from '../pages/Flota/Page';
import AlmacenesOficinas from '../pages/AlmacenesOficinas/Page';
import Pedidos from '../pages/Pedidos/Page';
import Configuracion from '../pages/Configuracion/Page';
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
    element: <Operaciones />,
  },
  {
    path: '/simulaciones',
    name: 'Simulaciones',
    icon: <DirectionsCar />,
    element: <Simulaciones />,
  },
  {
    path: '/flota',
    name: 'Flota',
    icon: <DirectionsCar />,
    element: <Flota />,
  },
  {
    path: '/almacenes',
    name: 'Almacenes y oficinas',
    icon: <Warehouse />,
    element: <AlmacenesOficinas />,
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    icon: <Inventory />,
    element: <Pedidos />,
  },
  {
    path: '/configuracion',
    name: 'Configuración',
    icon: <Settings />,
    element: <Configuracion />,
  },
];

export default routes;