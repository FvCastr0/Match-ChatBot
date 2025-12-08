import { Business } from "@prisma/client";

export abstract class BusinessRepository {
  abstract findBusinessByName(name: string): Promise<Business | null>;
  abstract findBusinessById(id: string): Promise<Business | null>;
}
