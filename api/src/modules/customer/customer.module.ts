import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CustomerService } from "./customer.service";

@Module({
  imports: [PrismaModule],
  providers: [CustomerService]
})
export class CustomerModule {}
