import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
async function bootstrap() {
  const PORT = process.env.PORT || 8000;
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown hooks
  // This ensures PrismaService.onModuleDestroy() (and its $disconnect()) runs on shutdown
  app.enableShutdownHooks();

  await app.listen(PORT);
  logger.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
