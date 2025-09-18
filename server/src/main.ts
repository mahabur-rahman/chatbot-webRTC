import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Enable class-validator globally
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
