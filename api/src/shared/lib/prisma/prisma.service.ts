import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private replicaClient: PrismaClient;

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });

    const replicaConnectionString = process.env.DATABASE_REPLICA_URL || process.env.DATABASE_URL;
    const replicaAdapter = new PrismaPg({ connectionString: replicaConnectionString });
    this.replicaClient = new PrismaClient({ adapter: replicaAdapter });
  }

  async onModuleInit() {
    await this.$connect();
    await this.replicaClient.$connect();
  }

  /**
   * Retorna a instancia de leitura conectada a réplica (Slave)
   */
  get read(): PrismaClient {
    return this.replicaClient;
  }
}
