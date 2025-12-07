import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { BusinessService } from "./business.service";

@Module({
  providers: [BusinessService],
  exports: [BusinessService],
  imports: [PrismaModule]
})
export class BusinessModule {}
