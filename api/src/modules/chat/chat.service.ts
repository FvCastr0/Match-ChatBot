import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Chat, ChatStatus, ContactReason, Steps } from "@prisma/client";
import { randomUUID } from "crypto";
import { ChatRepository } from "src/repositories/chat.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";
import { BusinessService } from "../business/business.service";
import { CustomerService } from "../customer/customer.service";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService extends ChatRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
    private readonly chatGateway: ChatGateway,
    private readonly customerService: CustomerService
  ) {
    super();
  }
  async findAndIsActive(customerId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { status: ChatStatus.open, customerId },
      select: { status: true, id: true }
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

  async findAll() {
    const chatData = await this.prisma.chat.findMany({
      include: {
        business: true,
        customer: true,
        messages: true
      }
    });

    return chatData;
  }

  async create(customerId: string) {
    const findChat = await this.prisma.chat.findFirst({
      where: { customerId, status: ChatStatus.open }
    });

    if (findChat)
      throw new UnauthorizedException(
        "Já existe um chat aberto com esse usuário."
      );

    const chat = await this.prisma.chat.create({
      data: {
        customerId,
        currentStep: Steps.started,
        status: ChatStatus.open,
        startedBy: "CUSTOMER"
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

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async finishAllChats() {
    await this.prisma.chat.updateMany({
      where: {
        currentStep: {
          not: "attendant"
        }
      },
      data: {
        closedAt: new Date(),
        status: ChatStatus.unfinished
      }
    });
  }

  async finishChat(id: string): Promise<void> {
    const updatedTicket = await this.prisma.chat.update({
      where: { id },
      data: { status: ChatStatus.finished, closedAt: new Date() }
    });

    this.chatGateway.server.emit("ticketClosed", {
      ticketId: updatedTicket.id
    });
  }

  async updateContactReason(chatId: string, contactReason: ContactReason) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { contactReason }
    });
  }

  async findChatAttendant(): Promise<Chat[] | null> {
    try {
      const chat = await this.prisma.chat.findMany({
        where: {
          currentStep: "attendant",
          status: ChatStatus.open
        },
        include: {
          business: true,
          customer: true,
          messages: true
        }
      });

      return chat;
    } catch (e) {
      throw new UnauthorizedException("Não foi possível carregar os chats.");
    }
  }

  getChatPayload(chatId: string): Promise<any> {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        customer: true,
        business: true,
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  async attendantStartChat(
    customerPhone: string,
    contactReason: ContactReason,
    message: string,
    businessName: string,
    customerName?: string
  ): Promise<string | null> {
    const chatId = randomUUID();
    const newChat = async (customerId: string) => {
      const business = await this.businessService.findByName(businessName);

      const findChat = await this.prisma.chat.findFirst({
        where: { customerId, status: ChatStatus.open }
      });

      if (findChat)
        throw new UnauthorizedException(
          "Você já tem um chat aberto com esse usuário."
        );

      if (!business)
        throw new UnauthorizedException("Negócio informado não existe.");
      await this.prisma.chat.create({
        data: {
          customer: {
            connect: { id: customerId }
          },
          business: {
            connect: { id: business.id }
          },
          id: chatId,
          contactReason,
          currentStep: Steps.attendant,
          status: ChatStatus.open,
          messages: {
            create: {
              content: message,
              sender: "AGENT"
            }
          },
          startedBy: "AGENT"
        }
      });
    };

    try {
      const findCustomer =
        await this.customerService.findCustomerByPhone(customerPhone);

      if (!findCustomer) {
        const customerId = randomUUID();
        await this.customerService.createCustomer(
          customerId,
          customerName ? customerName : "Nome não informado",
          customerPhone
        );

        await newChat(customerId);
      } else await newChat(findCustomer);
      const chatPayload = await this.getChatPayload(chatId);
      sendTextMessage(customerPhone, message);

      this.chatGateway.emitNewTicket(chatPayload);
      return chatId;
    } catch (e) {
      throw new UnauthorizedException("Não foi possível iniciar o chat.");
    }
  }
}
