export abstract class CustomerRepository {
  abstract findCustomer(id: string): Promise<boolean>;
  abstract createCustomer(id: string, name: string, phone: string): any;
}
