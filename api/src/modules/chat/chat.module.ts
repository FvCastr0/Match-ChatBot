import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { BusinessModule } from "../business/business.module";
import { CustomerModule } from "../customer/customer.module";
import { MessageModule } from "../message/message.module";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [PrismaModule, BusinessModule, MessageModule, CustomerModule],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
  controllers: [ChatController]
})
export class ChatModule {}
