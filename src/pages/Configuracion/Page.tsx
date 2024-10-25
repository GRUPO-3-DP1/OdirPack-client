import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import WebSocketManager from '../../store/webSocketManager';

const Page: React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);

    useEffect(() => {
        const wsManager = new WebSocketManager((data) => {
            if(data.userId) {
                setUserId(data.userId);
                console.log('userId recibido del servidor:', data.userId);
            }else{
                console.log('Mensaje recibido del servidor:', data);
            }
        });

        wsManager.connect();
        setSocketManager(wsManager);

        return () => {
            if (wsManager) {
                wsManager.close();
                console.log('Conexión WebSocket cerrada en cleanup');
            }
        };
    }, []);

    const handleIniciarSimulacion = async () => {
        const staticData = {
            pedidos: [
                {
                    idPedido: "PED-0001",
                    fechaRegistro: "2024-10-21T00:02:00",
                    ubigeoDestino: "150801",
                    cantidad: "30",
                    idCliente: "000707"
                },
                {
                    idPedido: "PED-0002",
                    fechaRegistro: "2024-10-21T00:00:00",
                    ubigeoDestino: "150501",
                    cantidad: "67",
                    idCliente: "000624"
                }
            ],
            vehiculos: [
                {
                    idVehiculo: "V001",
                    capacidadCarga: 120,
                    almacenOrigen: "150101",
                    fechaLibre: null
                },
                {
                    idVehiculo: "V002",
                    capacidadCarga: 120,
                    almacenOrigen: "150101",
                    fechaLibre: null
                }
            ],
            bloqueos: [
                {
                    fechaInicio: "2024-10-28T08:00:00",
                    fechaFin: "2024-10-28T10:00:00",
                    ubigeoOrigen: "001001",
                    ubigeoDestino: "051001"
                }
            ],
            fechaInicio: "2024-10-21T00:00:00"
        };

        try {
            const response = await axios.post(
                `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, staticData,
                { headers: ServicesProperties.Headers }
            );

            console.log('Simulación iniciada, respuesta del servidor:', response.data);
        } catch (error) {
            console.error('Error al iniciar la simulación:', error);
        }
    };

    return (
        <div>
            <h1>WebSocket Demo</h1>
            <button onClick={handleIniciarSimulacion}>Simulacion</button>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{`Mensaje del servidor: ${msg}`}</div>
                ))}
            </div>
        </div>
    );
};

export default Page;
