import { Test, TestingModule } from "@nestjs/testing";
import { Business, Chat } from "@prisma/client";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";
import { MessageService } from "src/modules/message/message.service";
import { StartedHandler } from "src/queue/started.handler";
import { detectCategory } from "src/shared/utils/detectCategory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendMessageWithTemplate } from "src/shared/utils/sendMessageWithTemplate";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";

jest.mock("src/shared/utils/detectCategory", () => ({
  detectCategory: jest.fn()
}));
jest.mock("src/shared/utils/sendMessageWithTemplate", () => ({
  sendMessageWithTemplate: jest.fn()
}));
jest.mock("src/shared/utils/sendTextMessage", () => ({
  sendTextMessage: jest.fn()
}));

describe("Started Handler", () => {
  let handler: StartedHandler;
  let chatService: ChatService;
  let businessService: BusinessService;
  let messageService: MessageService;

  const mockChat: Chat = {
    id: "512",
    currentStep: "started",
    customerId: "59912837759123",
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    businessId: "123"
  } as Chat;

  const mockMessageData: MessageData = {
    name: "Jorge",
    timeLastMsg: 995123,
    customerId: "12312",
    phone: "5511999999999",
    msg: "Quero uma pizza"
  } as MessageData;

  const mockBusiness: Business = {
    id: "123",
    name: "match_pizza"
  } as Business;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartedHandler,
        {
          provide: ChatService,
          useValue: {
            updateStep: jest.fn(),
            updateBusiness: jest.fn()
          }
        },
        {
          provide: BusinessService,
          useValue: {
            findByName: jest.fn()
          }
        },
        {
          provide: MessageService,
          useValue: {
            createMessage: jest.fn()
          }
        }
      ]
    }).compile();
    handler = module.get<StartedHandler>(StartedHandler);
    chatService = module.get<ChatService>(ChatService);
    businessService = module.get<BusinessService>(BusinessService);
    messageService = module.get<MessageService>(MessageService);
  });

  jest.clearAllMocks();

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should do nothing if chat is null", async () => {
    await handler.handle(null, mockMessageData);
    expect(messageService.createMessage).not.toHaveBeenCalled();
  });

  it("should run correctly if business exist", async () => {
    (detectCategory as jest.Mock).mockReturnValue("match_pizza");
    (businessService.findByName as jest.Mock).mockResolvedValue(mockBusiness);

    await handler.handle(mockChat, mockMessageData);

    expect(messageService.createMessage).toHaveBeenCalledWith(
      mockChat.id,
      mockMessageData.msg,
      "CUSTOMER"
    );
    expect(businessService.findByName).toHaveBeenCalledWith("match_pizza");

    expect(sendMessageWithTemplate).toHaveBeenCalledWith(
      mockMessageData.phone,
      "contact"
    );

    expect(chatService.updateStep).toHaveBeenCalledWith(
      mockChat.id,
      "contact_reason"
    );
    expect(chatService.updateBusiness).toHaveBeenCalledWith(
      mockChat.id,
      mockBusiness.name
    );
  });

  it("should return an error if bussines doesnt exist", async () => {
    (businessService.findByName as jest.Mock).mockResolvedValue(null);

    await handler.handle(mockChat, mockMessageData);

    expect(sendTextMessage).toHaveBeenCalledWith(
      mockMessageData.phone,
      expect.stringContaining("Você deve selecionar uma das três empresas")
    );

    expect(messageService.createMessage).toHaveBeenCalledWith(
      mockChat.id,
      "Opção não selecionada",
      "BOT"
    );

    expect(chatService.updateStep).not.toHaveBeenCalled();
  });
});
