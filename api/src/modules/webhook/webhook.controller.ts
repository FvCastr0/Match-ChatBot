import { InjectQueue } from "@nestjs/bullmq";
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { Response } from "express";
import { ProcessRecivedData } from "src/shared/utils/processRecivedData";
import { redisClient } from "src/shared/utils/redis";

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
  async reciveMessage(@Body() body: any, @Res() res: Response) {
    try {
      const dataMsgs = ProcessRecivedData(body);

      if (dataMsgs && dataMsgs.length > 0) {
        for (const dataMsg of dataMsgs) {
          // 1. Salva a mensagem bruta na Inbox do cliente no Redis
          await redisClient.rpush(`inbox:${dataMsg.customerId}`, JSON.stringify(dataMsg));
          
          // 2. Avisa a fila que este cliente tem mensagens para processar
          // O jobId idêntico ao customerId impede jobs duplicados concorrentes na fila
          const safeJobId = `proc_${dataMsg.customerId.replace(/:/g, "_")}`;
          await this.messageQueue.add("process-customer", { customerId: dataMsg.customerId }, {
            jobId: safeJobId, 
            attempts: 3,
            removeOnComplete: true,
            backoff: {
              type: "exponential",
              delay: 1000 
            }
          });
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Falha ao adicionar job na fila:", error);
      return res.sendStatus(500);
    }
  }
}
