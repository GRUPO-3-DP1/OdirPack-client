import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { FormControl, TextField } from '@mui/material';

const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header>
        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <TextField
            label="Tiempo"
            variant="outlined"
            size="small"
            disabled={true}
            value={""}
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