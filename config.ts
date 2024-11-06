export const Services = {
    BaseUrl: import.meta.env.VITE_API_URL || "xd",
    WebUrl: import.meta.env.VITE_WEBSOCKET_URL || "xd",
    Headers: {
        'Content-Type': 'application/json'
    },
    ServiceErrorConectionMessage: "Ocurrió un problema de conexión interna. Intentar nuevamente o contactar al equipo de soporte"
};
