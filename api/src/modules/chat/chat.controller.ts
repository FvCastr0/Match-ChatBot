import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get("problems")
  async findChats(@Res() res: Response) {
    try {
      return await this.chatService.findChatAttendant();
    } catch (e) {
      return res.sendStatus(500).send({ msgs: "Erro no servidor." });
    }
  }
}
