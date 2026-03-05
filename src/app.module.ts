import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { LawModule } from './law/law.module';

@Module({
  imports: [PrismaModule, IngestionModule, LawModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
