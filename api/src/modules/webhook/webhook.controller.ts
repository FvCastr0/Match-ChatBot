import { InjectQueue } from "@nestjs/bullmq";
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { Response } from "express";
import { ProcessRecivedData } from "src/shared/utils/processRecivedData";

@Controller("webhook")
export class WebhookController {
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  constructor(
    @InjectQueue("message-queue") private readonly messageQueue: Queue
  ) {}

  @Get()
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    if (mode === "subscribe" && token === this.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  @Post()
  async reciveMessage(@Body() body: any, @Res() res: Response) {
    const dataMsg = ProcessRecivedData(body);
    if (dataMsg === null) return res.sendStatus(200);

    try {
      await this.messageQueue.add("new-message", dataMsg, {
        attempts: 3,
        removeOnComplete: true
      });

      return res.sendStatus(200);
    } catch (error) {
      console.error("Falha ao adicionar job na fila:", error);
      return res.sendStatus(500);
    }
  }
}
