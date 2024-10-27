import React, { useState } from 'react';
import PanelBase from '../PanelBase/PanelBase';
import { ControlPosition } from '@vis.gl/react-google-maps';
import styles from './PanelLeyenda.module.css';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { BuildCircle, Home, LocalShipping, ShowChart, Store } from '@mui/icons-material';

interface PanelLeyendaProps {
  show?: boolean;
}

const PanelLeyenda: React.FC<PanelLeyendaProps> = ({ show = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {
        isOpen ?
          <PanelBase show={show} position={ControlPosition.BOTTOM_LEFT} >
            <div className={styles.container}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: 200,
                  alignItems: "center",
                  gap: 2.5,
                  px: 2,
                  py: 2.5,
                  bgcolor: "white",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography variant="h6" component="div">
                    Leyenda
                  </Typography>
                </Box>

                <List sx={{ width: "100%" }}>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping sx={{ color: "blue" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Camión" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Home sx={{ color: "black" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Almacén" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Store sx={{ color: "blue" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Oficina" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <BuildCircle sx={{ color: "red" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Camión Averiado" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <ShowChart sx={{ color: "blue" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Tramo" />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <ShowChart sx={{ color: "red" }} fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary="Bloqueo" />
                  </ListItem>
                </List>
              </Box>
            </div>
          </PanelBase >
          :
          <PanelBase show={show} position={ControlPosition.BOTTOM_LEFT} >
            <Button
              onClick={() => setIsOpen(true)}
            >
              Leyenda
            </Button>
          </PanelBase >
      }

    </>
  );
};

export default PanelLeyenda;