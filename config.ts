export const Services = {
    BaseUrl: import.meta.env.VITE_API_URL || "https://1inf54-982-3c.inf.pucp.edu.pe/api",
    WebUrl: import.meta.env.VITE_WEBSOCKET_URL || "wss://1inf54-982-3c.inf.pucp.edu.pe/api",
    Headers: {
        'Content-Type': 'application/json'
    },
    ServiceErrorConectionMessage: "Ocurrió un problema de conexión interna. Intentar nuevamente o contactar al equipo de soporte"
};
