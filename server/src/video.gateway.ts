import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JoinRoomPayload {
  roomCode: string;
  email: string;
}

interface SignalPayload {
  roomCode: string;
  signal: unknown;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // For development; restrict in production
  },
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track which rooms each client is in
  private clientRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const roomCode = this.clientRooms.get(client.id);
    if (roomCode) {
      client.to(roomCode).emit('user-left', { id: client.id });
      this.clientRooms.delete(client.id);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(data.roomCode);
    this.clientRooms.set(client.id, data.roomCode);
    // Notify others in the room about the new user
    client
      .to(data.roomCode)
      .emit('user-joined', { email: data.email, id: client.id });
    return { status: 'joined', roomCode: data.roomCode };
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: SignalPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomCode).emit('signal', {
      signal: data.signal,
      email: data.email,
      from: client.id,
    });
  }
}
