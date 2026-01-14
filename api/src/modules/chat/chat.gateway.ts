import { UseFilters } from "@nestjs/common";
import {
  BaseWsExceptionFilter,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@UseFilters(new BaseWsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    return `Client connected: ${client.id}`;
  }

  handleDisconnect(client: Socket) {
    return `Client disconnected: ${client.id}`;
  }

  notifyNewMessage(messagePayload: any) {
    this.server.emit("createMessage", messagePayload);
  }

  emitNewTicket(ticketPayload: any) {
    this.server.emit("newTicket", ticketPayload);
  }
}
