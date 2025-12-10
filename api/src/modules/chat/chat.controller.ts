import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { MessageService } from "../message/message.service";
import { attendantMessageDto } from "./dto/attendantMessage.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly messageService: MessageService) {}
  @UseGuards(JwtAuthGuard)
  @Post("message")
  async attendantMessage(@Body() data: attendantMessageDto) {
    try {
      await this.messageService.createMessage(
        data.chatId,
        data.message,
        "AGENT"
      );
    } catch (e) {
      throw new UnauthorizedException("Não foi possivel enviar a mensagem.");
    }
  }
}
