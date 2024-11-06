import React, { useState } from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { useSimulation } from '../../context/Simulacion/useSimulation';

const Layout: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div className={styles.container}>
      <Header isLoading={state.isPlaying}>
        
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;