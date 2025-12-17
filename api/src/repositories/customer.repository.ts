import { Customer } from "@prisma/client";

export abstract class CustomerRepository {
  abstract findCustomer(id: string): Promise<boolean>;
  abstract findAllCustomers(): Promise<Customer[]>;
  abstract createCustomer(id: string, name: string, phone: string): any;
}
