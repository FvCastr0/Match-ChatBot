import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";

@Module({
  imports: [PrismaModule],
  providers: [CustomerService],
  exports: [CustomerService],
  controllers: [CustomerController]
})
export class CustomerModule {}
