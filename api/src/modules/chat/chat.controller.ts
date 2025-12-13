import { Controller, Delete, Get, Param, Res, UseGuards } from "@nestjs/common";
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
      const chat = await this.chatService.findChatAttendant();
      return res.status(200).send(chat);
    } catch (e) {
      return res.status(500).send({ msgs: "Erro no servidor." });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete("finish/:id")
  async finishChat(@Param("id") id: string, @Res() res: Response) {
    try {
      await this.chatService.finishChat(id);
      return res.status(200).send({ msg: "Chat finalizado com sucesso." });
    } catch (e) {
      return res.status(500).send({ msg: "Erro no servidor." });
    }
  }
}
