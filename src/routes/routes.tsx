import {
  CellTowerOutlined,
  VideoSettingsOutlined,
  LocalShippingOutlined,
  MailOutlined,
  SettingsOutlined,
  WarehouseOutlined
} from "@mui/icons-material";
import Operaciones from '../pages/OperacionesDiaDia/Layout';
import Simulaciones from '../pages/Simulaciones/Layout.tsx';
import Flota from '../pages/Flota/Layout';
import AlmacenesOficinas from '../pages/AlmacenesOficinas/Layout';
import Pedidos from '../pages/Pedidos/Layout';
import Configuracion from '../pages/Configuracion/Layout';
import React from "react";
import { SimulationProvider } from "../context/Simulacion/SimulationContext";

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
    icon: <CellTowerOutlined />,
    element: (
      <Operaciones />
    )
  },
  {
    path: '/simulaciones',
    name: 'Simulaciones',
    icon: <VideoSettingsOutlined />,
    element: (
      <SimulationProvider>
        <Simulaciones />
      </SimulationProvider>
    ),
  },
  {
    path: '/flota',
    name: 'Flota',
    icon: <LocalShippingOutlined />,
    element: <Flota />,
  },
  {
    path: '/almacenes',
    name: 'Almacenes y oficinas',
    icon: <WarehouseOutlined />,
    element: <AlmacenesOficinas />,
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    icon: <MailOutlined />,
    element: <Pedidos />,
  },
  {
    path: '/configuracion',
    name: 'Configuración',
    icon: <SettingsOutlined />,
    element: <Configuracion />,
  },
];

export default routes;