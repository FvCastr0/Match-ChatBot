import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}
  async findBusinessByName(name: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        name
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!business) return null;
    else return business;
  }

  async findBusinessById(id: string) {
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
