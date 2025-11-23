import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { ProcessRecivedData } from "src/shared/utils/processRecivedData";
import { sendMessage } from "src/shared/utils/sendMessage";
import { CustomerService } from "../customer/customer.service";

@Controller("webhook")
export class WhatsappController {
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  @Get()
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    if (mode === "subscribe" && token === this.VERIFY_TOKEN) {
      console.log("Webhook verified!");
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  @Post()
  async reciveMessage(@Body() body: any, @Res() res: Response) {
    const dataMsg = ProcessRecivedData(body);
    if (dataMsg === null) return res.send(404);
    const hasCustomer = await new CustomerService().findCustomer(dataMsg.id);

    if (!hasCustomer) {
      await new CustomerService().createCustomer(
        dataMsg.id,
        dataMsg.name,
        dataMsg.phone
      );
      sendMessage(Number(dataMsg.phone), "business_redirect");
    }
    return res.sendStatus(200);
  }
}
