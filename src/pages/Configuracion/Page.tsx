import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import WebSocketManager from '../../store/webSocketManager';
import { ResponseAlgorithm } from '../../store/types/ResponseAlgorithm';

const Page: React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);
    const [responses, setResponses] = useState<ResponseAlgorithm[]>([]); // Arreglo para almacenar respuestas

    useEffect(() => {
        const wsManager = new WebSocketManager((data) => {
            if(data.userId) {
                setUserId(data.userId);
                console.log('userId recibido del servidor:', data.userId);
            }else{
                const newResponse: ResponseAlgorithm = data; // Asegúrate de que data sea del tipo ResponseAlgorithm
                setResponses((prevResponses) => [...prevResponses, newResponse]); // Actualiza el estado con la nueva respuesta
                console.log('Respuesta recibida:', newResponse);            }
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
            <button onClick={handleIniciarSimulacion}>Simulacion</button>
            <div>
                <h2>Respuestas recibidas:</h2>
                {responses.length > 0 ? (
                    responses.map((response, index) => (
                        <div key={index} style={{ margin: '5px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                            <h3>Respuesta {index + 1}</h3>
                            <pre>{JSON.stringify(response.pedidosNoPlanificados, null, 2)}</pre> {/* Muestra la respuesta como JSON formateado */}
                        </div>
                    ))
                ) : (
                    <p>No hay respuestas para mostrar.</p>
                )}
            </div>
        </div>
    );
};

export default Page;
