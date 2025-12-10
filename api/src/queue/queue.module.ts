import { Module } from "@nestjs/common";
import { BusinessModule } from "src/modules/business/business.module";
import { ChatModule } from "src/modules/chat/chat.module";
import { CustomerModule } from "src/modules/customer/customer.module";
import { MessageModule } from "src/modules/message/message.module";
import { WorkerProcessor } from "src/modules/worker/worker.processor";
import { AttendantHandler } from "./attendant.handler";
import { ContactReasonHandler } from "./contact-reason.handler";
import { StartedHandler } from "./started.handler";
import { StepHandlerFactory } from "./step-handler-factory";

@Module({
  imports: [CustomerModule, ChatModule, MessageModule, BusinessModule],
  providers: [
    WorkerProcessor,
    StepHandlerFactory,
    StartedHandler,
    ContactReasonHandler,
    AttendantHandler
  ],
  exports: [StepHandlerFactory]
})
export class QueueModule {}
