import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { Button } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';

const Layout: React.FC = () => {
  const{planificando, setPlanificando} = useOperacion();
  
  const startPlanificacion = async () => {
    console.log("startPlanificacion");
    setPlanificando(true);
  };

  const stopPlanificacion = () => {

    setPlanificando(false);
  };

  return (
    <div className={styles.container}>
      <Header>
        <Button
          className={styles.button}
          variant="contained"
          startIcon={planificando ? <Stop /> : <PlayArrow />}
          onClick={planificando ? stopPlanificacion : startPlanificacion}
          color={planificando ? 'error' : 'primary'}
          >
          {planificando ? 'Cancelar' : 'Planificar'}
        </Button>
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;