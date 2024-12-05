import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { Button, FormControl, TextField } from '@mui/material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';
import { PlayArrow, Stop } from '@mui/icons-material';

const Layout: React.FC = () => {

  const{startTime, planificando, setPlanificando} = useOperacion();
  
  const startPlanificacion = async () => {
    console.log("startPlanificacion");
    setPlanificando(true);
  };

  const stopPlanificacion = () => {
    setPlanificando(false);
  };
  
  const formattedTime = startTime ? startTime.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) : '';

  return (
    <div className={styles.container}>
      <Header>
        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <Button
            className={styles.button}
            variant="contained"
            startIcon={planificando ? <Stop /> : <PlayArrow />}
            onClick={planificando ? stopPlanificacion : startPlanificacion}
            color={planificando ? 'error' : 'primary'}
            >
            {planificando ? 'Cancelar' : 'Planificar'}
          </Button>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <TextField
            label="Tiempo"
            variant="outlined"
            size="small"
            disabled={true}
            value={formattedTime}
          />
        </FormControl>
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;