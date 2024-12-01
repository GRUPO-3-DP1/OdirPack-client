import { useState, useCallback } from 'react';
import { crearPedido, getPedidos } from '../services/pedido';
import { Pedido } from '../types/Pedido';

type PedidoData = {
  destinoId: string;
  cantidadTotal: number;
  clienteId: string;
};

type UsePedidosReturn = {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  fetchPedidos: () => Promise<void>;
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
  createPedido: (pedidoData: PedidoData) => Promise<void>;
};

function usePedidos(): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPedidos();
      setPedidos(data);
      console.log('Pedidos fetched successfully.');
    } catch (err) {
      setError(`Failed to fetch pedidos: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPedido = useCallback(async (pedidoData: PedidoData) => {
    setLoading(true);
    setError(null);
    try {
      await crearPedido(pedidoData);
      console.log('Pedido created successfully.');
      await fetchPedidos();
    } catch (err) {
      setError(`Failed to create pedido: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPedidos]);

  return { pedidos, loading, error, fetchPedidos, setPedidos, createPedido };
}

export default usePedidos;
