import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { ChatService } from "./chat.service";

@Module({
  imports: [PrismaModule],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
