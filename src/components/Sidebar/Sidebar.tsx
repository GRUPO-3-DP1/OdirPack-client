import React from 'react';
import styles from './Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import Logo from '../../assets/Titulo.png';
import { Button } from '@mui/material';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.imageContainer}>
          <img src={Logo} alt="OdiparPack Logo" className={styles.image} draggable={false} />
        </div>
        <nav>
          <ul className={styles.navList}>
            {routes.map((route) => (
              <li
                key={route.path}
                className={styles.navItem}
              >
                <Link
                  to={route.path}
                  className={`${styles.navLink} ${location.pathname === route.path ? styles.active : ''}`}
                  draggable={false}
                >
                  <span className={styles.icon}>{route.icon}</span>
                  <span className={styles.linkText}>{route.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.userSection}>
        <p className={styles.userName}>Grupo 3C</p>
        <p className={styles.userRole}>Supervisor de Operaciones</p>
        <Button variant='outlined' size='small'>Cerrar Sesión</Button>
      </div>
    </aside>
  );
};

export default Sidebar;