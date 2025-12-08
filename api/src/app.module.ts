import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { CustomerModule } from "./modules/customer/customer.module";
import { MessageModule } from "./modules/message/message.module";
import { UserModule } from "./modules/user/user.module";
import { WebhookModule } from "./modules/webhook/webhook.module";
import { WorkerModule } from "./modules/worker/worker.module";
import { PrismaModule } from "./shared/lib/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: Number(process.env.REDIS_PORT) || 6379
      }
    }),
    WebhookModule,
    CustomerModule,
    PrismaModule,
    CustomerModule,
    WorkerModule,
    UserModule,
    MessageModule
  ]
})
export class AppModule {}
