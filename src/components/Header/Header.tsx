import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import LoadingBar from '../Mapa/components/LoadingBar/LoadingBar';

interface HeaderProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  hideRouteTitle?: boolean; // Nueva prop para ocultar el título de la ruta
}

const Header: React.FC<HeaderProps> = ({ children, isLoading = false, hideRouteTitle = false }) => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);
  const title = currentRoute ? currentRoute.name : "Inicio";

  return (
    <div className={styles.mainHeader}>
      <header className={styles.header}>
        <div className={styles.container}>
          {!hideRouteTitle && (
            <h2 className={styles.title}>
              {title}
            </h2>
          )}
        </div>

        <div className={styles.container}>
          {children && <div className={styles.childrenContainer}>{children}</div>}
        </div>

      </header>
      <LoadingBar disabled={!isLoading} />
    </div >
  );
};

export default Header;
