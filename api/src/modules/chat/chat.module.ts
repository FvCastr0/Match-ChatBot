import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { BusinessModule } from "../business/business.module";
import { MessageModule } from "../message/message.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [PrismaModule, BusinessModule, MessageModule],
  providers: [ChatService],
  exports: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
