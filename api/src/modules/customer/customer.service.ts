import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}
  async findCustomer(id: string): Promise<boolean> {
    const hasCustomer = await this.prisma.customer.findFirst({ where: { id } });

    if (hasCustomer === null) return false;
    else return true;
  }

  async createCustomer(id: string, name: string, phone: string) {
    await this.prisma.customer.create({
      data: {
        id,
        phone,
        name
      }
    });
  }
}
