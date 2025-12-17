import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";
import { MessageService } from "../message/message.service";
import { attendantMessageDto } from "./dto/attendantMessage.dto";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get("groupedDate")
  async messageGrouped(@Res() res: Response) {
    try {
      const data = await this.messageService.getQuantityOfMessages();
      res.status(200).send(data);
    } catch (e) {
      throw new UnauthorizedException("Não foi possível carregar os dados");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("attendant")
  async attendantMessage(@Body() data: attendantMessageDto) {
    try {
      const newMessage = await this.messageService.createMessage(
        data.chatId,
        data.content,
        "AGENT"
      );

      await sendTextMessage(data.phone, data.content);

      return newMessage;
    } catch (e) {
      throw new UnauthorizedException("Não foi possivel enviar a mensagem.");
    }
  }
}
