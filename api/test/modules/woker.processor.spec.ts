import { Test, TestingModule } from "@nestjs/testing";
import { Chat } from "@prisma/client";
import { Job } from "bullmq";
import { ChatService } from "src/modules/chat/chat.service";
import { CustomerService } from "src/modules/customer/customer.service";
import { MessageService } from "src/modules/message/message.service";
import { WorkerProcessor } from "src/modules/worker/worker.processor";
import { StepHandlerFactory } from "src/queue/step-handler-factory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendMessageWithTemplate } from "src/shared/utils/sendMessageWithTemplate";

jest.mock("src/shared/utils/sendMessageWithTemplate");

describe("Worker Processor", () => {
  let customerService: CustomerService;
  let chatService: ChatService;
  let messageService: MessageService;
  let stepFactory: StepHandlerFactory;
  let processor: WorkerProcessor;

  const mockMessageData: MessageData = {
    name: "Jorge",
    timeLastMsg: 995123,
    customerId: "12312",
    phone: "5511999999999",
    msg: "Quero uma pizza"
  } as MessageData;

  const mockJob = {
    name: "new-message",
    data: mockMessageData
  } as unknown as Job;

  const mockChat: Chat = {
    id: "512",
    currentStep: "started",
    customerId: "59912837759123",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    businessId: "123"
  } as Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerProcessor,
        {
          provide: CustomerService,
          useValue: {
            findCustomer: jest.fn(),
            createCustomer: jest.fn()
          }
        },
        {
          provide: ChatService,
          useValue: {
            findAndIsActive: jest.fn(),
            create: jest.fn(),
            findData: jest.fn()
          }
        },
        {
          provide: MessageService,
          useValue: {
            createMessage: jest.fn()
          }
        },
        {
          provide: StepHandlerFactory,
          useValue: {
            getHandler: jest.fn()
          }
        }
      ]
    }).compile();

    processor = module.get<WorkerProcessor>(WorkerProcessor);
    customerService = module.get<CustomerService>(CustomerService);
    chatService = module.get<ChatService>(ChatService);
    messageService = module.get<MessageService>(MessageService);
    stepFactory = module.get<StepHandlerFactory>(StepHandlerFactory);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  it("should create a customer if doesnt exist", async () => {
    (customerService.findCustomer as jest.Mock).mockResolvedValue(null);
    (chatService.findAndIsActive as jest.Mock).mockResolvedValue(null);
    (chatService.create as jest.Mock).mockResolvedValue(mockChat);

    await processor.process(mockJob);

    expect(customerService.createCustomer).toHaveBeenCalledWith(
      mockMessageData.customerId,
      mockMessageData.name,
      mockMessageData.phone
    );
  });

  it("should create a chat and send message if dont have an active chat", async () => {
    (customerService.findCustomer as jest.Mock).mockResolvedValue({
      id: "cust_1"
    });
    (chatService.findAndIsActive as jest.Mock).mockResolvedValue(null);
    (chatService.create as jest.Mock).mockResolvedValue(mockChat);

    await processor.process(mockJob);

    expect(messageService.createMessage).toHaveBeenCalledWith(
      mockChat.id,
      mockMessageData.msg,
      "CUSTOMER"
    );

    expect(sendMessageWithTemplate).toHaveBeenCalledWith(
      mockMessageData.phone,
      "business_redirect"
    );

    expect(messageService.createMessage).toHaveBeenCalledWith(
      mockChat.id,
      "Mensagem redirecionamento empresa",
      "BOT"
    );
  });

  it("should delegate to the correct step handler if chat is active", async () => {
    const mockHandler = {
      handle: jest.fn().mockResolvedValue(true)
    };

    (customerService.findCustomer as jest.Mock).mockResolvedValue({
      id: "cust_1"
    });
    (chatService.findAndIsActive as jest.Mock).mockResolvedValue(mockChat);
    (chatService.findData as jest.Mock).mockResolvedValue(mockChat);
    (stepFactory.getHandler as jest.Mock).mockReturnValue(mockHandler);

    await processor.process(mockJob);

    expect(stepFactory.getHandler).toHaveBeenCalledWith(mockChat.currentStep);
    expect(mockHandler.handle).toHaveBeenCalledWith(mockChat, mockMessageData);
  });
});
