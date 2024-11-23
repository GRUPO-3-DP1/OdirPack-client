import { Services as ServicesProperties } from '../../config';

class WebSocketManager {
  private socket: WebSocket | null = null;
  private onMessageCallback: (message: any) => void;

  constructor(onMessage: (message: any) => void) {
    this.onMessageCallback = onMessage;
  }

  connect() {
    this.socket = new WebSocket(`${ServicesProperties.WebUrl}/conexion-websocket`);

    this.socket.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido del servidor desde WebSocketManager:', data);
      this.onMessageCallback(data);
    };

    this.socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };

  }

  close() {
    if (this.socket) {
      this.socket.close();
      console.log('Conexión WebSocket cerrada');
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default WebSocketManager;