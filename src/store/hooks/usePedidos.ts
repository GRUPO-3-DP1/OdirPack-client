import { useState } from 'react';
import { crearPedido, getPedidos } from '../services/pedido';
import { Pedido } from '../types/Pedido';

type PedidoHooksReturn = {
    pedidos: Pedido[];
    loading: boolean;
    error: any;
    fetchPedidos: () => Promise<void>;
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
    createPedido: (pedidoData: { destinoId: string, cantidadTotal: number, clienteId: string }) => Promise<void>;
};

function usePedidos(): PedidoHooksReturn {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Inicialmente no está cargando
    const [error, setError] = useState<any>(null);

    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getPedidos();
            setPedidos(data); 
            console.log("Se cargaron datos de BD");
        } catch (err) {
            setError("Error en usePedidos: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    // Función para crear un pedido
    const createPedido = async (pedidoData: { destinoId: string, cantidadTotal: number, clienteId: string }) => {
        setLoading(true);
        setError(null);

        try {
            await crearPedido(pedidoData);

        } catch (err) {
            setError("Error al crear el pedido: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return { pedidos, loading, error, fetchPedidos, setPedidos, createPedido};
}

export default usePedidos;