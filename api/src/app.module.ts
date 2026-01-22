import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { MediaModule } from "./modules/media/media.module";
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
        url: process.env.NODE_ENV === "production" ? process.env.REDIS_URL : "",
        name: process.env.NODE_ENV !== "production" ? "queue-system" : "",
        port: process.env.NODE_ENV !== "production" ? 6379 : undefined
      }
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 200
        }
      ]
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
    ChatModule,
    MediaModule
  ]
})
export class AppModule {}
