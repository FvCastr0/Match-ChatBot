import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { MessageService } from "./message.service";

@Module({
  providers: [MessageService],
  exports: [MessageService],
  imports: [PrismaModule]
})
export class MessageModule {}
