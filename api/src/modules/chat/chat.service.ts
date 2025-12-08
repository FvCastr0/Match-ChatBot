import { Injectable } from "@nestjs/common";
import { ContactReason, Steps } from "@prisma/client";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";
import { BusinessService } from "../business/business.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService
  ) {}
  async findChatAndIsActive(customerId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { isActive: true, customerId },
      select: { isActive: true, id: true }
    });

    if (chat !== null) return chat;
    else return null;
  }

  async findChatData(chatId: string) {
    const chatData = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    return chatData;
  }

  async createChat(customerId: string) {
    const chat = await this.prisma.chat.create({
      data: {
        customerId,
        currentStep: Steps.started,
        isActive: true
      }
    });
    return chat;
  }

  async updateChatStep(chatId: string, step: Steps) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { currentStep: step }
    });
  }

  async updateBusinessChat(chatId: string, businessName: string) {
    const business =
      await this.businessService.findBusinessByName(businessName);
    if (business)
      await this.prisma.chat.update({
        where: { id: chatId },
        data: {
          business: {
            connect: { id: business.id }
          }
        }
      });
  }

  async updateContactReason(chatId: string, contactReason: ContactReason) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { contactReason }
    });
  }

  async updateChatActive(chatId: string, isActive: boolean) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { isActive }
    });
  }
}
