import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";
import { MessageService } from "../message/message.service";
import { attendantMessageDto } from "./dto/attendantMessage.dto";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

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
