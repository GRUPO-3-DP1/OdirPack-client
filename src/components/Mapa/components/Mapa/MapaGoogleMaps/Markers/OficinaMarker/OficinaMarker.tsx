import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import styles from './OficinaMarker.module.css';
import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes';
import OficinaIcon from './Icons/OficinaIcon';
import AlmacenIcon from './Icons/AlmacenIcon';

interface OficinaMarkerProps extends Omit<AdvancedMarkerProps, 'position'> {
  oficina: Oficina;
  ocupacion?: 'baja' | 'media' | 'alta';
  onClick?: (event: google.maps.MapMouseEvent) => void;
}

const OficinaMarker: React.FC<OficinaMarkerProps> = ({ oficina, ocupacion = 'baja', onClick, ...markerProps }) => {

  const espacio = {
    baja: '#34A853',
    media: '#FBBC05',
    alta: '#EA4335',
  }[ocupacion];

  const color: string = oficina.isAlmacen ? 'black' : espacio;

  return (
    <AdvancedMarker
      position={{ lat: oficina.latitud, lng: oficina.longitud }}
      onClick={onClick}
      {...markerProps}
    >
      <div className={styles.iconWrapper}>
        {oficina.isAlmacen ?
          <AlmacenIcon size='small' />
          :
          <OficinaIcon mainColor={color} size='tiny' />
        }
      </div>
    </AdvancedMarker >
  );
};

export default OficinaMarker;