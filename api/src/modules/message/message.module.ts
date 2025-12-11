import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
  providers: [MessageService],
  exports: [MessageService],
  imports: [PrismaModule],
  controllers: [MessageController]
})
export class MessageModule {}
