import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend requests
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Mokko Backend is running on: http://localhost:${port}`);
  logger.log(`📄 Receipt API: http://localhost:${port}/api/receipt/generate`);
  logger.log(`📱 WhatsApp API: http://localhost:${port}/api/receipt/send`);
}

bootstrap();
