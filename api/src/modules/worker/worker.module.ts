import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { ChatModule } from "../chat/chat.module";
import { CustomerModule } from "../customer/customer.module";
import { WorkerProcessor } from "./worker.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "message-queue"
    }),
    CustomerModule,
    ChatModule,
    BusinessModule
  ],
  providers: [WorkerProcessor],
  exports: [WorkerModule]
})
export class WorkerModule {}
