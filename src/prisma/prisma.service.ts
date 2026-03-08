import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    // Determine log levels based on environment
    // Only enable 'query' logging in non-production environments
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevels: Prisma.LogLevel[] = isProduction
      ? ['warn', 'error'] // Production: only warn and error
      : ['query', 'info', 'warn', 'error']; // Dev/staging: full logging

    super({
      adapter,
      log: logLevels,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
