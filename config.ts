export const Services = {
    //BaseUrl: "http://localhost:8081",
    BaseUrl: import.meta.env.VITE_BASE_URL || "http://200.16.7.178/api",
    //BaseUrl:"https://localhost:44369",
    //BaseUrl:"http://54.235.188.31",
    //https://api.daoch.me
    //WebUrl: "ws://localhost:8081",
    WebUrl: import.meta.env.VITE_WEB_URL || "200.16.7.178/api",
    Headers: {
        'Content-Type': 'application/json'
    },
    ServiceErrorConectionMessage: "Ocurrió un problema de conexión interna. Intentar nuevamente o contactar al equipo de soporte"
};
