import React from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import Logo from '../../assets/Titulo.png';
import { Button } from '@mui/material';

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.imageContainer}>
        <img src={Logo} alt="Descripción de mi imagen" className={styles.image} />
      </div>
      <nav>
        <ul className={styles.navList}>
          {routes.map((route) => (
            <li key={route.path} className={styles.navItem}>
              <Link to={route.path} className={styles.navLink}>
                <span className={styles.icon}>{route.icon}</span>
                <span className={styles.linkText}>{route.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.userSection}>
        <p className={styles.userName}>Nombre Apellido</p>
        <p className={styles.userRole}>Supervisor de Operaciones</p>
        <Button variant='outlined' size='small'>Cerrar Sesión</Button>
      </div>
    </aside>
  );
};

export default Sidebar;