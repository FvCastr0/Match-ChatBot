import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { ChatService } from "./chat.service";
import { AttendantStartDto } from "./dto/attendantStart";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get("problems")
  async findChats(@Res() res: Response) {
    try {
      const chat = await this.chatService.findChatAttendant();
      return res.status(200).send(chat);
    } catch (e) {
      return res.status(500).send({ msgs: "Erro no servidor." });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("attendant/start")
  async attendantStart(@Body() data: AttendantStartDto, @Res() res: Response) {
    try {
      const chat = await this.chatService.attendantStartChat(
        data.customerPhone,
        data.contactReason,
        data.businessName,
        data.customerName,
        data.order
      );
      return res.status(201).send({ id: chat });
    } catch (e) {
      return res.status(500).send({ msg: "Erro no servidor." });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch("finish/:id")
  async finishChat(@Param("id") id: string, @Res() res: Response) {
    try {
      await this.chatService.finishChat(id);

      return res.status(200).send({ msg: "Chat finalizado com sucesso." });
    } catch (e) {
      return res.status(500).send({ msg: "Erro no servidor." });
    }
  }
}
