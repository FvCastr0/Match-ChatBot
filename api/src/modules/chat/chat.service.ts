import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException, UnauthorizedException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Chat, ChatStatus, ContactReason, Steps, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { ChatRepository } from "src/repositories/chat.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";
import { sendTemplateMessage } from "src/shared/utils/sendTemplateMessage";
import { BusinessService } from "../business/business.service";
import { CustomerService } from "../customer/customer.service";
import { ChatGateway } from "./chat.gateway";
import { sendInteractiveList } from "src/shared/utils/sendInteractiveList";
import { redisClient } from "src/shared/utils/redis";

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
        messages: true,
        rating: true
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

  async sendRatingRequestIfEligible(chatId: string) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          customer: true,
          messages: {
            where: { sender: "CUSTOMER" },
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      });

      if (!chat || !chat.customer?.phone) return;

      const lastCustomerMsg = chat.messages[0];
      if (!lastCustomerMsg) return;

      const now = Date.now();
      const lastMsgTime = new Date(lastCustomerMsg.createdAt).getTime();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      if (now - lastMsgTime > twentyFourHoursMs) {
        console.log(`⏳ Janela de 24h expirada para o cliente ${chat.customer.phone}. Avaliação não enviada.`);
        return;
      }

      await sendInteractiveList(
        chat.customer.phone,
        "Como você avalia o atendimento recebido? Sua opinião é muito importante para nós! 🌟",
        "Avaliar",
        [
          {
            title: "Opções de Avaliação",
            rows: [
              { id: "rating_5", title: "⭐⭐⭐⭐⭐ 5 - Excelente", description: "Atendimento perfeito" },
              { id: "rating_4", title: "⭐⭐⭐⭐ 4 - Bom", description: "Atendimento muito bom" },
              { id: "rating_3", title: "⭐⭐⭐ 3 - Regular", description: "Atendimento razoável" },
              { id: "rating_2", title: "⭐⭐ 2 - Ruim", description: "Deixou a desejar" },
              { id: "rating_1", title: "⭐ 1 - Péssimo", description: "Atendimento insatisfeito" }
            ]
          }
        ]
      );

      const redisPayload = JSON.stringify({
        chatId: chat.id,
        step: "SCORE"
      });

      await redisClient.set(
        `pending_rating:${chat.customerId}`,
        redisPayload,
        "EX",
        86400
      );
      console.log(`⭐ Pesquisa de avaliação disparada para customerId: ${chat.customerId}`);
    } catch (error) {
      console.error("Erro ao enviar pesquisa de avaliação:", error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async finishAllChats() {
    const chatsToClose = await this.prisma.chat.findMany({
      where: {
        status: ChatStatus.open,
        currentStep: {
          not: "attendant"
        }
      },
      select: { id: true }
    });

    await this.prisma.chat.updateMany({
      where: {
        status: ChatStatus.open,
        currentStep: {
          not: "attendant"
        }
      },
      data: {
        closedAt: new Date(),
        status: ChatStatus.unfinished
      }
    });

    for (const chat of chatsToClose) {
      await this.sendRatingRequestIfEligible(chat.id);
    }
  }

  async finishChat(id: string): Promise<void> {
    const updatedTicket = await this.prisma.chat.update({
      where: { id },
      data: { status: ChatStatus.finished, closedAt: new Date() }
    });

    this.chatGateway.server.emit("ticketClosed", {
      ticketId: updatedTicket.id
    });

    await this.sendRatingRequestIfEligible(id);
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
          messages: true,
          rating: true
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
        },
        rating: true
      }
    });
  }

  async attendantStartChat(
    customerPhone: string,
    contactReason: ContactReason,
    businessName: string,
    customerName: string,
    order: string
  ): Promise<string | null> {
    const chatId = randomUUID();

    const businessVerification = async (tx: Prisma.TransactionClient) => {
      const business = await this.businessService.findByName(businessName, tx);
      if (!business)
        throw new NotFoundException("Negócio informado não existe.");
      return business.id;
    };

    const newChat = async (customerId: string, tx: Prisma.TransactionClient) => {
      if (!customerId) {
        throw new BadRequestException("ID do cliente inválido.");
      }

      const findChat = await tx.chat.findFirst({
        where: { customerId, status: ChatStatus.open }
      });

      if (findChat)
        throw new BadRequestException(
          "Você já tem um chat aberto com esse usuário."
        );

      const business = await businessVerification(tx);
      await tx.chat.create({
        data: {
          customer: {
            connect: { id: customerId }
          },
          business: {
            connect: { id: business }
          },
          id: chatId,
          contactReason,
          currentStep: Steps.attendant,
          status: ChatStatus.open,
          messages: {
            create: {
              content: "Mensagem inicial",
              sender: "AGENT"
            }
          },
          startedBy: "AGENT"
        }
      });
    };

    try {
      await this.prisma.$transaction(async (tx) => {
        const findCustomer = await tx.customer.findFirst({
          where: { phone: customerPhone }
        });

        if (!findCustomer) {
          const customerId = randomUUID();
          await tx.customer.create({
            data: {
              id: customerId,
              name: customerName,
              phone: customerPhone,
              role: "CUSTOMER"
            }
          });

          await newChat(customerId, tx);
        } else {
          await newChat(findCustomer.id, tx);
        }

        // Garante que o template seja enviado com sucesso antes de efetivar o cadastro no BD
        await sendTemplateMessage(customerPhone, "service_contact", customerName, order);
      });

      const chatPayload = await this.getChatPayload(chatId);

      this.chatGateway.emitNewTicket(chatPayload);
      return chatId;
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new BadRequestException(
        e.message || "Erro ao enviar mensagem no WhatsApp. O chat não foi criado."
      );
    }
  }
}
