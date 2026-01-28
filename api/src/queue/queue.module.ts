import { Module } from "@nestjs/common";
import { BusinessModule } from "src/modules/business/business.module";
import { ChatModule } from "src/modules/chat/chat.module";
import { CustomerModule } from "src/modules/customer/customer.module";
import { MessageModule } from "src/modules/message/message.module";
import { WorkerProcessor } from "src/modules/worker/worker.processor";
import { AttendantHandler } from "./attendant.handler";
import { BusinessRedirectHandler } from "./business-redirect.handler";
import { ContactReasonHandler } from "./contact-reason.handler";
import { StepHandlerFactory } from "./step-handler-factory";

@Module({
  imports: [CustomerModule, ChatModule, MessageModule, BusinessModule],
  providers: [
    WorkerProcessor,
    StepHandlerFactory,
    BusinessRedirectHandler,
    ContactReasonHandler,
    AttendantHandler
  ],
  exports: [StepHandlerFactory]
})
export class QueueModule {}
