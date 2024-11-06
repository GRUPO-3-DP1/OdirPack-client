import React, { useState } from 'react';
import PanelBase from '../PanelBase/PanelBase';
import { ControlPosition } from '@vis.gl/react-google-maps';
import styles from './PanelLeyenda.module.css';
import { IconButton, Switch } from '@mui/material';
import { Close, Map } from '@mui/icons-material';
import { leyendaItems } from '../../../../../../../data/leyendaItems';
import { useMapMarker } from '../../../../../../../context/MapMarker/useMapMarker';

type PanelLeyendaProps = {
  show?: boolean;
};

const PanelLeyenda: React.FC<PanelLeyendaProps> = ({ show = true }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { visibility, toggleVisibility } = useMapMarker();

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
                  <Close fontSize='inherit' />
                </IconButton>
              </div>

              <ul className={styles.lista}>
                {leyendaItems.map((item, index) =>
                  <li key={index} className={styles.item}>
                    <Switch size='small' defaultChecked={visibility[item.name]} onClick={() => toggleVisibility(item.name)} />
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
          <PanelBase
            show={show}
            position={ControlPosition.BOTTOM_LEFT}
            className={styles.button}
          >
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
