import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import LoadingBar from '../Mapa/components/LoadingBar/LoadingBar';
import Fecha from '../utils/Fecha';

interface HeaderProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, isLoading = false }) => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);

  const title = currentRoute ? currentRoute.name : "Inicio";

  return (
    <div className={styles.mainHeader}>
      <header className={styles.header}>

        <div className={styles.container}>
          <h2 className={styles.title}>
            {title}
          </h2>
          <Fecha className={styles.currentDate} />
        </div>

        <div className={styles.container}>
          {children && <div className={styles.childrenContainer}>{children}</div>}
        </div>

      </header>
      <LoadingBar disabled={!isLoading} />
    </div >
  );
};

export default Header;;