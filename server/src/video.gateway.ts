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
    origin: '*',
  },
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track users per room
  private roomUsers = new Map<string, Map<string, string>>(); // roomCode -> Map<clientId, email>
  private clientRooms = new Map<string, string>(); // clientId -> roomCode

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // You can add more setup logic here if needed
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomCode = this.clientRooms.get(client.id);
    if (roomCode) {
      const users = this.roomUsers.get(roomCode);
      if (users) {
        users.delete(client.id);
        if (users.size === 0) {
          this.roomUsers.delete(roomCode);
        } else {
          this.server
            .to(roomCode)
            .emit('room-users', Array.from(users.values()));
        }
      }
      client.to(roomCode).emit('user-left', { id: client.id });
      this.clientRooms.delete(client.id);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(data.roomCode);
    this.clientRooms.set(client.id, data.roomCode);

    if (!this.roomUsers.has(data.roomCode)) {
      this.roomUsers.set(data.roomCode, new Map());
    }
    this.roomUsers.get(data.roomCode)!.set(client.id, data.email);

    // Broadcast all users' emails in the room
    const users = this.roomUsers.get(data.roomCode)!;
    this.server
      .to(data.roomCode)
      .emit('room-users', Array.from(users.values()));

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

  @SubscribeMessage('call-request')
  handleCallRequest(
    @MessageBody() toEmail: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Relay to all except sender
    client.broadcast.emit('call-request', toEmail);
  }

  @SubscribeMessage('call-accept')
  handleCallAccept(
    @MessageBody() _data: any,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('call-accept');
  }

  @SubscribeMessage('call-cancel')
  handleCallCancel(
    @MessageBody() _data: any,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('call-cancel');
  }
}
