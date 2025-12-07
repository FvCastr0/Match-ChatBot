import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { BusinessModule } from "../business/business.module";
import { ChatService } from "./chat.service";

@Module({
  imports: [PrismaModule, BusinessModule],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
