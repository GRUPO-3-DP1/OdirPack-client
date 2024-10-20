import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';

const Header: React.FC = () => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);

  const title = currentRoute ? currentRoute.name : 'Dashboard';

  return (
    <header className={styles.header}>
      <h1>{title}</h1>
    </header>
  );
};

export default Header;