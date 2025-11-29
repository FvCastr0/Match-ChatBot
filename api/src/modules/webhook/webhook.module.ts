import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { WebhookController } from "./webhook.controller";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "message-queue"
    })
  ],
  controllers: [WebhookController],
  providers: []
})
export class WebhookModule {}
