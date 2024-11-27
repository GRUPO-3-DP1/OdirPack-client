// Header.tsx
import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import SimulationTimeDisplay from '../utils/SimulationTimeDisplay';
import LoadingBar from '../Mapa/components/LoadingBar/LoadingBar';

interface HeaderProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, isLoading = false }) => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);

  const title = currentRoute ? currentRoute.name : "Inicio";

  const showSimulationTime = location.pathname === '/simulaciones';

  return (
    <div className={styles.mainHeader}>
      <header className={styles.header}>
        {/* Contenedor Izquierdo: Título e Información de Simulación */}
        <div className={styles.leftContainer}>
          <h2 className={styles.title}>{title}</h2>
          {showSimulationTime && (
            <div className={styles.simulationInfo}>
              <SimulationTimeDisplay className={styles.currentDate} />
            </div>
          )}
        </div>

        {/* Contenedor Derecho: Botones y Selectores */}
        <div className={styles.rightContainer}>
          <div className={styles.childrenContainer}>{children}</div>
        </div>
      </header>
      <LoadingBar disabled={!isLoading} />
    </div>
  );
};

export default Header;
