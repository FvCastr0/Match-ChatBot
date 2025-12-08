import { Business } from "@prisma/client";

export abstract class BusinessRepository {
  abstract findByName(name: string): Promise<Business | null>;
  abstract findById(id: string): Promise<Business | null>;
}
