import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { ScheduleModule } from "@nestjs/schedule";
import * as redisStore from "cache-manager-redis-store";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { MessageModule } from "./modules/message/message.module";
import { UserModule } from "./modules/user/user.module";
import { WebhookModule } from "./modules/webhook/webhook.module";
import { WorkerModule } from "./modules/worker/worker.module";
import { QueueModule } from "./queue/queue.module";
import { PrismaModule } from "./shared/lib/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BullModule.forRoot({
      connection: {
       url: process.env.REDIS_URL,
      }
    }),

    ScheduleModule.forRoot(),
    WebhookModule,
    CustomerModule,
    PrismaModule,
    CustomerModule,
    WorkerModule,
    UserModule,
    MessageModule,
    QueueModule,
    AuthModule,
    ChatModule
  ]
})
export class AppModule {}
