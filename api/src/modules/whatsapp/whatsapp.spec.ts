import { Test } from "@nestjs/testing";
import { Response } from "express";
import { CustomerService } from "../customer/customer.service";
import { WhatsappController } from "./whatsapp.controller";

const mockCustomerService = {
  findCustomer: jest.fn(),
  createCustomer: jest.fn()
};

jest.mock("src/shared/utils/processRecivedData", () => ({
  ProcessRecivedData: jest.fn()
}));

describe("Whatsapp Controller", () => {
  let controller: WhatsappController;
  const mockResponse = {
    status: jest.fn(() => mockResponse),
    send: jest.fn(),
    sendStatus: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService
        }
      ]
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
    process.env.WHATSAPP_VERIFY_TOKEN = "MY_SECRET_TOKEN";
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("verify webhook (GET)", () => {
    const challenge = "challenge_accepted";

    it("should return 200 if the mode and the challenge if mode and token are correct", () => {
      controller.verifyWebhook(
        "subscribe",
        "MY_SECRET_TOKEN",
        challenge,
        mockResponse as unknown as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(challenge);
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    });

    it("should return 403 if token is incorrect", () => {
      controller.verifyWebhook(
        "subscribe",
        "WRONG_TOKEN",
        challenge,
        mockResponse as unknown as Response
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 403 if mode is not 'subscribe'", () => {
      controller.verifyWebhook(
        "unsubscribe",
        "MY_SECRET_TOKEN",
        challenge,
        mockResponse as unknown as Response
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("recive message (POST)", () => {});
});
