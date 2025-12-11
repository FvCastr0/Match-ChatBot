import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Chat, ContactReason, Steps } from "@prisma/client";
import { ChatRepository } from "src/repositories/chat.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";
import { BusinessService } from "../business/business.service";

@Injectable()
export class ChatService extends ChatRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService
  ) {
    super();
  }
  async findAndIsActive(customerId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { isActive: true, customerId },
      select: { isActive: true, id: true }
    });

    if (chat !== null) return chat;
    else return null;
  }

  async findData(chatId: string) {
    const chatData = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    return chatData;
  }

  async create(customerId: string) {
    const chat = await this.prisma.chat.create({
      data: {
        customerId,
        currentStep: Steps.started,
        isActive: true
      }
    });
    return chat;
  }

  async updateStep(chatId: string, step: Steps) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { currentStep: step }
    });
  }

  async updateBusiness(chatId: string, businessName: string) {
    const business = await this.businessService.findByName(businessName);
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

  async finishChat(id: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id },
      data: { isActive: false }
    });

    await this.updateStep(id, "finished");
  }

  async updateContactReason(chatId: string, contactReason: ContactReason) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { contactReason }
    });
  }

  async findChatAttendant(): Promise<Chat[] | null> {
    try {
      return await this.prisma.chat.findMany({
        where: {
          currentStep: "attendant"
        }
      });
    } catch (e) {
      throw new UnauthorizedException("Não foi possível carregar os chats.");
    }
  }
}
