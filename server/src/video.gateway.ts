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
  signal: unknown; // Use a more specific type if possible
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(data.roomCode);
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
