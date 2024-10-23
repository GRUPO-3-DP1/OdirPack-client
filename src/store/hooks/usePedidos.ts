import { useState } from 'react';
import { getPedidos } from '../services/pedido';
import { Pedido } from '../types/Pedido';

type PedidoHooksReturn = {
    pedidos: Pedido[];
    loading: boolean;
    error: any;
    fetchPedidos: () => Promise<void>;
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
        } catch (err) {
            setError("Error en usePedidos: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return { pedidos, loading, error, fetchPedidos };
}

export default usePedidos;
