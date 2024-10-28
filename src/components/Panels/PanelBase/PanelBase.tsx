import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React, { ReactNode } from 'react';
import styles from './PanelBase.module.css';

type PanelBaseProps = {
  show: boolean;
  position: ControlPosition;
  className?: string;
  children: ReactNode;
};

const PanelBase: React.FC<PanelBaseProps> = ({ show, position, className, children }) => {
  if (!show) {
    return null;
  }
  return (
    <MapControl position={position}>
      <div className={`${styles.panel} ${className}`}>
        {children}
      </div>
    </MapControl>
  );
};

export default PanelBase;