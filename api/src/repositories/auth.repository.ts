import { User } from "@prisma/client";

export abstract class AuthRepository {
  abstract validateUser(name: string, password: string): Promise<User | null>;
  abstract generateToken(user: any): string;
}
