import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { CustomerModule } from "../customer/customer.module";
import { WorkerProcessor } from "./worker.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "message-queue"
    }),
    CustomerModule
  ],
  providers: [WorkerProcessor],
  exports: [WorkerModule]
})
export class WorkerModule {}
