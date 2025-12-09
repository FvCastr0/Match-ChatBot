import { User } from "@prisma/client";

type UserWithoutPassword = Omit<User, "password">;

export abstract class UserRepository {
  abstract returnAllUsers(): Promise<Array<UserWithoutPassword>>;
  abstract findUserByUsername(
    user: string
  ): Promise<UserWithoutPassword | null>;
  abstract create({ user, password, role }: User): Promise<boolean>;
  abstract findAndVerifyPassword(
    name: string,
    password: string
  ): Promise<UserWithoutPassword | null>;
}
