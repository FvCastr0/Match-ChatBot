import { Test, TestingModule } from "@nestjs/testing";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { CustomerService } from "./customer.service";

const prismaServiceMock = {
  customer: {
    findFirst: jest.fn(),
    create: jest.fn()
  }
};

type MockPrismaService = typeof prismaServiceMock;

describe("Customer Service", () => {
  let service: CustomerService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        }
      ]
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get<MockPrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Find Customer", () => {
    const customerId = "abc123";

    it("should return true if user exist", async () => {
      prisma.customer.findFirst.mockResolvedValue({
        id: customerId,
        name: "Test"
      });

      const result = await service.findCustomer(customerId);

      expect(result).toBe(true);

      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: customerId }
      });
    });

    it("should return false if user doesnt exist", async () => {
      prisma.customer.findFirst.mockResolvedValue(null);
      const result = await service.findCustomer(customerId);

      expect(result).toBe(false);

      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: customerId }
      });
    });
  });

  describe("Create Customer", () => {
    const customerData = {
      phone: "5554774854129",
      name: "Test",
      id: randomUUID()
    };

    it("should create a customer", async () => {
      prisma.customer.create.mockResolvedValue(customerData);

      await service.createCustomer(
        customerData.id,
        customerData.name,
        customerData.phone
      );

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: { ...customerData }
      });

      expect(prisma.customer.create).toHaveBeenCalledTimes(1);
    });
  });
});
