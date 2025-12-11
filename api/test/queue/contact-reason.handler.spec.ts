import { Test, TestingModule } from "@nestjs/testing";
import { Chat, ContactReason } from "@prisma/client";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";
import { MessageService } from "src/modules/message/message.service";
import { ContactReasonHandler } from "src/queue/contact-reason.handler";
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

describe("Contact Reason", () => {
  let handler: ContactReasonHandler;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactReasonHandler,
        {
          provide: ChatService,
          useValue: {
            updateStep: jest.fn(),
            updateBusiness: jest.fn(),
            finishChat: jest.fn(),
            updateContactReason: jest.fn()
          }
        },
        {
          provide: BusinessService,
          useValue: {
            findById: jest.fn()
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

    handler = module.get<ContactReasonHandler>(ContactReasonHandler);
    chatService = module.get<ChatService>(ChatService);
    businessService = module.get<BusinessService>(BusinessService);
    messageService = module.get<MessageService>(MessageService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return nothing if chat doesnt exist", async () => {
    await handler.handle(null, mockMessageData);
    expect(messageService.createMessage).not.toHaveBeenCalled();
  });

  it("should process an order correctly", async () => {
    (detectCategory as jest.Mock).mockReturnValue("order");
    (businessService.findById as jest.Mock).mockResolvedValue({
      name: "match_pizza"
    });

    await handler.handle(mockChat, mockMessageData);

    expect(businessService.findById).toHaveBeenCalledWith(mockChat.businessId);
    expect(sendMessageWithTemplate).toHaveBeenCalledWith(
      mockMessageData.phone,
      "place_order_pizza"
    );

    expect(chatService.finishChat).toHaveBeenCalledWith(mockChat.id);
    expect(chatService.updateContactReason).toHaveBeenCalledWith(
      mockChat.id,
      ContactReason.order
    );
  });

  it("should return an error if business doesnt exist", async () => {
    (detectCategory as jest.Mock).mockReturnValue("order");
    (businessService.findById as jest.Mock).mockResolvedValue(null);

    await handler.handle(mockChat, mockMessageData);

    expect(sendTextMessage).toHaveBeenCalledWith(
      mockMessageData.phone,
      "Empresa não foi encontrada"
    );

    expect(chatService.finishChat).not.toHaveBeenCalled();
  });

  it("should process a problem correctly", async () => {
    (detectCategory as jest.Mock).mockReturnValue("problem");

    await handler.handle(mockChat, mockMessageData);

    expect(sendMessageWithTemplate).toHaveBeenCalledWith(
      mockMessageData.phone,
      "problem"
    );

    expect(chatService.finishChat).not.toHaveBeenCalled();

    expect(chatService.updateStep).toHaveBeenCalledWith(
      mockChat.id,
      "attendant"
    );

    expect(chatService.updateContactReason).toHaveBeenCalledWith(
      mockChat.id,
      "problem"
    );
  });

  it("should process a feedback correctly", async () => {
    (detectCategory as jest.Mock).mockReturnValue("feedback");

    await handler.handle(mockChat, mockMessageData);

    expect(sendTextMessage).toHaveBeenCalledWith(
      mockMessageData.phone,
      expect.stringContaining("Perfeito! Envie seu feedback")
    );
    expect(chatService.finishChat).toHaveBeenCalledWith(mockChat.id);
    expect(chatService.updateContactReason).toHaveBeenCalledWith(
      mockChat.id,
      ContactReason.feedback
    );
  });

  it("should ask to select a valid option", async () => {
    (detectCategory as jest.Mock).mockReturnValue(null);

    await handler.handle(mockChat, mockMessageData);

    expect(sendTextMessage).toHaveBeenCalledWith(
      mockMessageData.phone,
      expect.stringContaining("Você deve selecionar um dos três motivos")
    );

    expect(chatService.finishChat).not.toHaveBeenCalled();
    expect(chatService.updateStep).not.toHaveBeenCalled();
  });
});
