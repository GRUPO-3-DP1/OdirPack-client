import React from 'react';
import styles from './Main.module.css';
import { Outlet } from 'react-router-dom';

const Main: React.FC = () => {
  return (
    <div className={styles.container}>
      <Outlet />
    </div>

  );
};

export default Main;