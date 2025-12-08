import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { QueueModule } from "src/queue/queue.module";
import { ChatModule } from "../chat/chat.module";
import { CustomerModule } from "../customer/customer.module";
import { MessageModule } from "../message/message.module";
import { WorkerProcessor } from "./worker.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "message-queue"
    }),
    QueueModule,
    MessageModule,
    CustomerModule,
    ChatModule
  ],
  providers: [WorkerProcessor],
  exports: [WorkerModule]
})
export class WorkerModule {}
