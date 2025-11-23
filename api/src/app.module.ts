import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CustomerModule } from "./modules/customer/customer.module";
import { WhatsappModule } from "./modules/whatsapp/whatsapp.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    WhatsappModule,
    CustomerModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    CustomerModule
  ]
})
export class AppModule {}
