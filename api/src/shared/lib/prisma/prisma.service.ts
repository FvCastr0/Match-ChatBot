import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private replicaClient: PrismaClient;
  private primaryPool: Pool;
  private replicaPool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const primaryPool = new Pool({ connectionString });
    const adapter = new PrismaPg(primaryPool);
    super({ adapter });
    this.primaryPool = primaryPool;

    const replicaConnectionString = process.env.DATABASE_REPLICA_URL || process.env.DATABASE_URL;
    const replicaPool = new Pool({ connectionString: replicaConnectionString });
    const replicaAdapter = new PrismaPg(replicaPool);
    this.replicaClient = new PrismaClient({ adapter: replicaAdapter });
    this.replicaPool = replicaPool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.replicaClient.$connect();
      this.logger.log("Conexões com banco primário e réplica estabelecidas com sucesso.");
    } catch (error) {
      this.logger.error("Erro ao conectar ao banco de dados com Prisma:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.replicaClient.$disconnect();
    await this.primaryPool.end();
    await this.replicaPool.end();
  }

  /**
   * Retorna a instancia de leitura conectada a réplica (Slave)
   */
  get read(): PrismaClient {
    return this.replicaClient;
  }
}
