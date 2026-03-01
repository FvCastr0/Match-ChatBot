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
  ) { }

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
  reciveMessage(@Body() body: any, @Res() res: Response) {
    // 1. Responde IMEDIATAMENTE a Meta com 200 OK
    // Isso evita que a Meta considere falha no envio e faça retentativas duplicadas
    res.sendStatus(200);

    // 2. Continua o processamento no background de forma assíncrona (Fire and Forget)
    (async () => {
      try {
        const dataMsgs = ProcessRecivedData(body);

        if (!dataMsgs || dataMsgs.length === 0) return;

        for (const dataMsg of dataMsgs) {
          await this.messageQueue.add("new-message", dataMsg, {
            jobId: dataMsg.messageId, // Meta's message ID guarantees uniqueness and prevents retry duplication
            attempts: 3,
            removeOnComplete: true,
            backoff: {
              type: "exponential",
              delay: 1000 // if it fails, retry in 1s -> 2s -> 4s instead of waiting a full minute default
            }
          });
        }
      } catch (error) {
        console.error("Falha ao adicionar job na fila (background):", error);
      }
    })();
  }
}
