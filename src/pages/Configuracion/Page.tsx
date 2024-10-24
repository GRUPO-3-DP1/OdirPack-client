import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';

const Page: React.FC = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8081/simulacion-websocket');

        ws.onopen = () => {
            console.log('Conexión WebSocket establecida');
        };

        ws.onmessage = (event) => {
            console.log('Mensaje recibido del servidor:', event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        ws.onerror = (error) => {
            console.error('Error en la conexión WebSocket:', error);
        };

        ws.onclose = () => {
            console.log('Conexión WebSocket cerrada');
        };

        setSocket(ws);

    }, []);

    // Definición del objeto estático
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

    const handleSendMessage = async () => {
        if (socket) {
            socket.send('Hola desde el frontend');
        }
    };

    const handleBroadcast = async () => {
      try {
        const response = await axios.post(`${ServicesProperties.BaseUrl}/api/enviarMensaje`, {
          message: 'Mensaje para broadcast'
      }, {
          headers: ServicesProperties.Headers
      });
      } catch (error) {
          console.error('Error al enviar el mensaje de broadcast:', error);
      }
    };

    const handleIniciarSimulacion = async () => {
        try {
            const response = await axios.post(`${ServicesProperties.BaseUrl}/simulacion/iniciar`, staticData, {
                headers: ServicesProperties.Headers
            });
            console.log('Simulación iniciada, respuesta del servidor:', response.data);
        } catch (error) {
            console.error('Error al iniciar la simulación:', error);
        }
    };

    return (
        <div>
            <h1>WebSocket Demo</h1>
            <button onClick={handleSendMessage}>Enviar Mensaje</button>
            <button onClick={handleBroadcast}>Enviar Broadcast</button>
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
