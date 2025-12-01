import { Injectable } from "@nestjs/common";
import { Roles } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

const saltRounds = 10;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async returnAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        user: true,
        role: true,
        id: true
      }
    });
  }

  async findUserByUsername(user: string) {
    return await this.prisma.user.findUnique({ where: { user } });
  }

  async create({
    user,
    password,
    role
  }: {
    user: string;
    password: string;
    role: Roles;
  }): Promise<boolean> {
    const findUser = await this.prisma.user.findUnique({ where: { user } });
    if (!findUser) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await this.prisma.user.create({
        data: { user, password: hashedPassword, role, id: randomUUID() }
      });
      return true;
    } else return false;
  }
}
