import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/lib/prisma/prisma.module";
import { RatingService } from "./rating.service";

@Module({
  imports: [PrismaModule],
  providers: [RatingService],
  exports: [RatingService]
})
export class RatingModule {}
