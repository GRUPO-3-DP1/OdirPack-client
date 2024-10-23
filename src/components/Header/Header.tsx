import React from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';
import routes from '../../routes/routes';
import Fecha from '../utils/Fecha';
import { DateField, TimeField } from '@mui/x-date-pickers';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

const Header: React.FC = () => {
  const location = useLocation();

  const currentRoute = routes.find(route => route.path === location.pathname);

  const title = currentRoute ? currentRoute.name : "Inicio";

  const isSimulacion = currentRoute?.name === "Simulaciones";

  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {title}
        </h2>
        <Fecha className={styles.currentDate} />
      </div>
      <div className={styles.container}>
        {
          isSimulacion &&
          <div className={styles.containerSimulacion}>
            <DateField
              size="small"
              label="Fecha"
              sx={{ width: '135px' }}
            />
            <TimeField
              size="small"
              label="Hora"
              sx={{ width: '100px' }}
            />
            <FormControl>
              <InputLabel id="demo-simple-select-helper-label" size="small">Tipo</InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={age}
                label="Tipo"
                size="small"
                onChange={handleChange}
                sx={{ width: '170px' }}
              >
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="colapso">Hasta el colapso</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant='contained'
              startIcon={<PlayArrow />}
            >
              Iniciar
            </Button>
          </div>
        }
      </div>
    </header>
  );
};

export default Header;