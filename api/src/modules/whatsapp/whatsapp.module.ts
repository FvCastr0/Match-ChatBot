import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CustomerService } from "../customer/customer.service";
import { WhatsappController } from "./whatsapp.controller";

@Module({
  imports: [PrismaModule],
  controllers: [WhatsappController],
  providers: [CustomerService]
})
export class WhatsappModule {}
