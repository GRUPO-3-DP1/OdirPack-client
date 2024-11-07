import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { FormControl, TextField } from '@mui/material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';

const Layout: React.FC = () => {
  const{startTime} = useOperacion();

  const formattedTime = startTime ? startTime.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) : '';

  return (
    <div className={styles.container}>
      <Header>
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