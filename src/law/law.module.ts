import { Module } from '@nestjs/common';
import { LawService } from './law.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LawService],
  exports: [LawService],
})
export class LawModule {}
