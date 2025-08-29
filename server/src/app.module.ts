import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoGateway } from './video.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, VideoGateway],
})
export class AppModule {}
