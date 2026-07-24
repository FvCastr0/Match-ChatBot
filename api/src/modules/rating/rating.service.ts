import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateScore(chatId: string, score: number) {
    return this.prisma.rating.upsert({
      where: { chatId },
      update: { score },
      create: { chatId, score }
    });
  }

  async updateComment(chatId: string, comment: string) {
    return this.prisma.rating.update({
      where: { chatId },
      data: { comment }
    });
  }

  async findByChatId(chatId: string) {
    return this.prisma.rating.findUnique({
      where: { chatId }
    });
  }
}
