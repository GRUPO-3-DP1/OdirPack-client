import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import Fecha from '../utils/Fecha';

const Header: React.FC = () => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);

  const title = currentRoute ? currentRoute.name : 'Dashboard';

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>
        {title}
      </h2>
      <Fecha className={styles.currentDate} />
    </header>
  );
};

export default Header;