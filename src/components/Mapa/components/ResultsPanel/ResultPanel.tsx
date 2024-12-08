// ResultPanel.tsx

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import { useData } from '../../../../context/useData';

import OrderTable from './components/orderTable';
import TruckTable from './components/truckTable';
import OrderSectionModal from './components/orderSectionModal';
import TruckSectionModal from './components/truckSectionModal';
import { OrderRow, TruckRow } from '../../../../context/Simulacion/simulationTypes'; 


type OrderTramoDetalle = NonNullable<OrderRow['tramosDetalle']>[number];
type TruckTramoDetalle = NonNullable<TruckRow['tramosDetalle']>[number];

interface ResultPanelProps {
  show?: boolean;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ show = true }) => {
  const { state } = useData();

  const [orderRows, setOrderRows] = useState<OrderRow[]>([]);
  const [truckRows, setTruckRows] = useState<TruckRow[]>([]);

  // Estados para los modals
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openTruckModal, setOpenTruckModal] = useState(false);
  const [orderTramos, setOrderTramos] = useState<OrderTramoDetalle[]>([]);
  const [truckTramos, setTruckTramos] = useState<TruckTramoDetalle[]>([]);

  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (state.ends && state.simulationHistory.length > 0) {
      // Por defecto, mostrar la última entrada
      setHistoryIndex(state.simulationHistory.length - 1);
    }
  }, [state.ends, state.simulationHistory]);

  useEffect(() => {
    if (historyIndex !== null && state.simulationHistory[historyIndex]) {
      const entry = state.simulationHistory[historyIndex];
      setOrderRows(entry.pedidos);
      setTruckRows(entry.camiones);
    }
  }, [historyIndex, state.simulationHistory]);

  const handleShowOrderTramos = (row: OrderRow) => {
    const tramos = row.tramosDetalle || [];
    setOrderTramos(tramos);
    setOpenOrderModal(true);
  };

  const handleShowTruckTramos = (row: TruckRow) => {
    const tramos = row.tramosDetalle || [];
    setTruckTramos(tramos);
    setOpenTruckModal(true);
  };

  if (!show) return null;

  return (
    <Box sx={{ padding: 2 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign:'center', mb:2 }}>
            Plan de transporte
          </Typography>
          <Divider sx={{ marginY: 0.5 }} />
          <TruckTable data={truckRows} onShowTramos={handleShowTruckTramos} />
        </Box>
        <Box>
          <OrderTable data={orderRows} onShowTramos={handleShowOrderTramos} />
        </Box>
      </Stack>
      <OrderSectionModal 
        open={openOrderModal} 
        onClose={() => setOpenOrderModal(false)} 
        tramos={orderTramos.map(tramo => ({
          ...tramo,
          camion: tramo.camion || '' // Provide default empty string
        }))}
      />
      <TruckSectionModal
        open={openTruckModal}
        onClose={() => setOpenTruckModal(false)}
        tramos={truckTramos}
      />
    </Box>
  );
};

export default ResultPanel;
