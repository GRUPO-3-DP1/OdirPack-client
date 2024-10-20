import {
  CellTowerOutlined,
  VideoSettingsOutlined,
  LocalShippingOutlined,
  MailOutlined,
  SettingsOutlined,
  WarehouseOutlined
} from "@mui/icons-material";
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
    icon: <CellTowerOutlined />,
    element: <Operaciones />,
  },
  {
    path: '/simulaciones',
    name: 'Simulaciones',
    icon: <VideoSettingsOutlined />,
    element: <Simulaciones />,
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