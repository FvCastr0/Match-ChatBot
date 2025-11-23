import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { ProcessRecivedData } from "src/shared/utils/processRecivedData";
import { CustomerService } from "../customer/customer.service";

@Controller("webhook")
export class WhatsappController {
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  constructor(private readonly customerService: CustomerService) {}

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
    if (dataMsg === null) return res.send(404);
    const hasCustomer = await this.customerService.findCustomer(dataMsg.id);

    if (!hasCustomer) {
      await this.customerService.createCustomer(
        dataMsg.id,
        dataMsg.name,
        dataMsg.phone
      );
    }
    return res.sendStatus(200);
  }
}
