import { PrismaClient } from "@prisma/client";

const CostumerRepository = new PrismaClient().costumer;

export class Costumer {
  constructor(private costumer: typeof CostumerRepository) {}
  public async FindCostumer(id: number): Promise<boolean> {
    const find = await this.costumer.findFirst({
      where: {
        id
      }
    });
    return find !== null ? true : false;
  }

  public async CreateCostumer(
    id: number,
    phone: number,
    lastMessageTime: number,
    lastMessageContent: string
  ) {
    await this.costumer.create({
      data: {
        id,
        phone,
        lastMessageTime,
        lastMessageContent,
        hasAnActiveChat: false
      }
    });
  }

  public async updateLastMessage(
    id: number,
    lastMessageTime: number,
    lastMessageContent: string
  ) {
    await this.costumer.update({
      where: {
        id
      },
      data: {
        lastMessageContent,
        lastMessageTime
      }
    });
  }

  public async hasAnActiveChat(id: number) {
    return await this.costumer.findFirst({
      where: { id },
      select: { hasAnActiveChat: true }
    });
  }
}

export const costumerService = new Costumer(CostumerRepository);
