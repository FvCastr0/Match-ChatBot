import { InjectQueue } from "@nestjs/bullmq";
import { Body, Controller, Get, Post, Query, Res, Headers, Req, ForbiddenException } from "@nestjs/common";
import { createHmac } from "crypto";
import type { Queue } from "bullmq";
import type { Response, Request } from "express";
import { ProcessRecivedData } from "src/shared/utils/processRecivedData";
import { redisClient } from "src/shared/utils/redis";

@Controller("webhook")
export class WebhookController {
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  private readonly APP_SECRET = process.env.WHATSAPP_APP_SECRET;
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
  async reciveMessage(
    @Body() body: any,
    @Headers("x-hub-signature-256") signature: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      console.log("📥 Recebido POST /webhook com body:", JSON.stringify(body, null, 2));
      if (this.APP_SECRET) {
        if (!signature) {
          console.warn("⚠️ Assinatura ausente!");
          throw new ForbiddenException("Signature missing");
        }
        const rawBody = req.rawBody;
        if (!rawBody) {
          console.warn("⚠️ Raw body ausente!");
          throw new ForbiddenException("Raw body missing");
        }

        const expectedSignature = "sha256=" + createHmac("sha256", this.APP_SECRET)
          .update(rawBody)
          .digest("hex");

        if (signature !== expectedSignature) {
          console.warn("⚠️ Assinatura inválida! Recebida:", signature, "Esperada:", expectedSignature);
          throw new ForbiddenException("Invalid signature");
        }
      }
      const dataMsgs = ProcessRecivedData(body);
      console.log("🔍 Mensagens processadas a partir do payload:", JSON.stringify(dataMsgs, null, 2));

      if (dataMsgs && dataMsgs.length > 0) {
        for (const dataMsg of dataMsgs) {
          // 1. Salva a mensagem bruta na Inbox do cliente no Redis
          console.log(`💾 Salvando inbox:${dataMsg.customerId} no Redis...`);
          await redisClient.rpush(`inbox:${dataMsg.customerId}`, JSON.stringify(dataMsg));
          
          // 2. Avisa a fila que este cliente tem mensagens para processar
          // O Lock Distribuído por customerId no worker cuida da concorrência entre réplicas
          console.log(`🚀 Adicionando job na fila message-queue para customerId:`, dataMsg.customerId);
          await this.messageQueue.add("process-customer", { customerId: dataMsg.customerId }, {
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: true,
            backoff: {
              type: "exponential",
              delay: 1000 
            }
          });
        }
      } else {
        console.log("ℹ️ Nenhuma mensagem válida retornada por ProcessRecivedData.");
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Falha ao processar webhook / adicionar job na fila:", error);
      return res.sendStatus(500);
    }
  }
}
