import { Module } from '@nestjs/common';
import { LawService } from './law.service';

@Module({
  providers: [LawService],
  exports: [LawService],
})
export class LawModule {}
