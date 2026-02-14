import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }
}
