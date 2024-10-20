import React from 'react';
import styles from './Main.module.css';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';

const Main: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>

  );
};

export default Main;