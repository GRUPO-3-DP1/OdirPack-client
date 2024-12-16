import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelection } from '../../../../context/Buscador/useSelection';
import { useData, useOperacionData } from '../../../../context/useData';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled = false }) => {
  const [searchCode, setSearchCode] = useState<string>('');
  const {
    setSelectedOficina,
    setSelectedCamion,
    setSelectedPedido
  } = useSelection();
  
  // Intentar obtener el contexto de simulación primero
  let data;
  try {
    data = useData();
  } catch {
    // Si falla, usar el contexto de operación
    data = useOperacionData();
  }

  const { state: simulationState } = data;

  const getDynamicBackground = (value: string | null) => (value ? '#E6F0FB' : '#FAFAFA');

  const handleSearch = () => {
    const query = searchCode.trim();

    // Reset selections
    setSelectedOficina(null);
    setSelectedCamion(null);
    setSelectedPedido(null);

    // Custom search logic if provided
    if (onSearch) {
      onSearch(query);
      return;
    }

    // Default search logic
    if (query.includes(',')) {
      const [departamento, provincia] = query.split(',').map(part => part.trim().toUpperCase());
      const office = simulationState.offices.find((office) =>
        office.departamento.toUpperCase() === departamento &&
        office.provincia.toUpperCase() === provincia
      );
      if (office) {
        setSelectedOficina(office);
        return;
      }
    }

    // Search in vehicles
    const truck = simulationState.vehicles.find((vehicle) => vehicle.idVehiculo === query);
    if (truck) {
      setSelectedCamion(truck);
      return;
    }

    // Search in orders
    const allOrders = [
      ...simulationState.unplannedOrders,
      ...simulationState.vehicles.flatMap(vehicle => vehicle.ruta?.pedidos || [])
    ];

    const order = allOrders.find((order) =>
      order.idPedido.toUpperCase() === query
    );
    if (order) {
      setSelectedPedido(order);
      return;
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      gap={2}
    >
      <TextField
        size="small"
        placeholder="Código del Pedido, Camión u Oficina"
        value={searchCode}
        onChange={(e) => setSearchCode(e.target.value)}
        disabled={disabled}
        sx={{
          width: 486,
          backgroundColor: getDynamicBackground(searchCode),
        }}
        inputProps={{
          style: {
            fontSize: '14px',
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        disabled={disabled}
        sx={{
          minWidth: '40px',
          height: '35px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchIcon />
      </Button>
    </Box>
  );
};

export default SearchBar;