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
        setLoading(true);  // Cambiar a "true" al iniciar la llamada
        setError(null);    // Resetear cualquier error anterior

        try {
            const data = await getPedidos();
            setPedidos(data);  // Almacena los pedidos en el estado
        } catch (err) {
            setError("Error en usePedidos: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return { pedidos, loading, error, fetchPedidos };
}

export default usePedidos;
