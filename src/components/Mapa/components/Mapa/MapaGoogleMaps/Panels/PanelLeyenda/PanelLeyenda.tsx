import React, { useState } from 'react';
import { Switch, Divider } from '@mui/material';
import { Map } from '@mui/icons-material';
import { leyendaItems } from '../../../../../../../data/leyendaItems';
import { useMapMarker } from '../../../../../../../context/MapMarker/useMapMarker';
import styles from './PanelLeyenda.module.css';

type PanelLeyendaProps = {
  show?: boolean;
};

const PanelLeyenda: React.FC<PanelLeyendaProps> = ({ show = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { visibility, toggleVisibility } = useMapMarker();

  if (!show) {
    return null;
  }

  return (
    <>
      {/* Botón flotante para mostrar/ocultar la leyenda */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Map />
      </button>

      {isOpen && (
        <div className={styles.panelContainer}>
          <div className={styles.container}>
            <div className={styles.title}>
              Leyenda
            </div>

            <Divider sx={{ marginY: 0 }} />

            <ul className={styles.lista}>
              {leyendaItems.map((item, index) => (
                <li key={index} className={styles.item}>
                  <Switch size='small' checked={visibility[item.name]} onClick={() => toggleVisibility(item.name)} />
                  <div>
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default PanelLeyenda;
