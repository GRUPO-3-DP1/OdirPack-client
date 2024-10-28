import React, { useState } from 'react';
import PanelBase from '../PanelBase/PanelBase';
import { ControlPosition } from '@vis.gl/react-google-maps';
import styles from './PanelLeyenda.module.css';
import { IconButton } from '@mui/material';
import { BuildCircle, Close, Home, LocalShipping, Map, ShowChart, Store } from '@mui/icons-material';

const leyendaItems: { icon: JSX.Element, text: string; }[] = [
  { icon: <LocalShipping sx={{ color: "blue" }} fontSize='small' />, text: "Camión" },
  { icon: <Home sx={{ color: "black" }} fontSize='small' />, text: "Almacén" },
  { icon: <Store sx={{ color: "blue" }} fontSize='small' />, text: "Oficina" },
  { icon: <BuildCircle sx={{ color: "red" }} fontSize='small' />, text: "Camión Averiado" },
  { icon: <ShowChart sx={{ color: "blue" }} fontSize='small' />, text: "Tramo" },
  { icon: <ShowChart sx={{ color: "red" }} fontSize='small' />, text: "Bloqueo" },
];

type PanelLeyendaProps = {
  show?: boolean;
};

const PanelLeyenda: React.FC<PanelLeyendaProps> = ({ show = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {
        isOpen ?
          <PanelBase show={show} position={ControlPosition.BOTTOM_LEFT} >
            <div className={styles.container}>

              <div className={styles.title}>
                Leyenda
                <IconButton
                  onClick={() => setIsOpen(false)}
                  size='small'
                >
                  <Close />
                </IconButton>
              </div>

              <ul className={styles.lista}>
                {leyendaItems.map((item, index) =>
                  <li key={index} className={styles.item}>
                    <div>
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </li>
                )}
              </ul>

            </div>
          </PanelBase >
          :
          <PanelBase show={show} position={ControlPosition.BOTTOM_LEFT} >
            <IconButton
              onClick={() => setIsOpen(true)}
              size='small'
            >
              <Map />
            </IconButton>
          </PanelBase >
      }

    </>
  );
};

export default PanelLeyenda;
