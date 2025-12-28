import { Injectable } from "@nestjs/common";
import { Customer } from "@prisma/client";
import { CustomerRepository } from "src/repositories/customer.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class CustomerService extends CustomerRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findCustomer(id: string): Promise<boolean> {
    const hasCustomer = await this.prisma.customer.findFirst({ where: { id } });

    if (hasCustomer === null) return false;
    else return true;
  }

  async findCustomerByPhone(phone: string): Promise<string | null> {
    const hasCustomer = await this.prisma.customer.findFirst({
      where: { phone }
    });

    if (hasCustomer === null) return null;
    else return hasCustomer.id;
  }

  async findAllCustomers(): Promise<Customer[]> {
    return await this.prisma.customer.findMany({
      include: {
        chats: true
      }
    });
  }

  async findCustomerData(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        chats: {
          select: {
            id: true,
            messages: true,
            business: true,
            contactReason: true,
            createdAt: true
          }
        }
      }
    });
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
