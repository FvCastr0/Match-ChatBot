import { Injectable } from "@nestjs/common";
import { StepHandler } from "src/repositories/queue.repository";
import { AttendantHandler } from "./attendant.handler";
import { BusinessRedirectHandler } from "./business-redirect.handler";
import { ContactReasonHandler } from "./contact-reason.handler";

@Injectable()
export class StepHandlerFactory {
  constructor(
    private readonly businessRedirectHandler: BusinessRedirectHandler,
    private readonly contactReasonHandler: ContactReasonHandler,
    private readonly attendantHandler: AttendantHandler
  ) {}

  getHandler(step: string | null | undefined): StepHandler {
    switch (step) {
      case "started":
        return this.contactReasonHandler;
      case "business_redirect":
        return this.businessRedirectHandler;
      case "attendant":
        return this.attendantHandler;
      default:
        return this.contactReasonHandler;
    }
  }
}
