import { Injectable } from "@nestjs/common";
import { Business, Prisma } from "@prisma/client";
import { BusinessRepository } from "src/repositories/business.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class BusinessService extends BusinessRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async findByName(name: string, tx?: Prisma.TransactionClient): Promise<Business | null> {
    const prisma = tx ?? this.prisma;
    const business = await prisma.business.findFirst({
      where: {
        name
      }
    });

    if (!business) return null;
    else return business;
  }

  async findById(id: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        id
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!business) return null;
    else return business;
  }
}
