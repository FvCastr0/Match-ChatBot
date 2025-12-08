import { Injectable } from "@nestjs/common";
import { StepHandler } from "src/repositories/queue.repository";
import { ContactReasonHandler } from "./contact-reason.handler";
import { StartedHandler } from "./started.handler";

@Injectable()
export class StepHandlerFactory {
  constructor(
    private readonly startedHandler: StartedHandler,
    private readonly contactReasonHandler: ContactReasonHandler
  ) {}

  getHandler(step: string | null | undefined): StepHandler {
    switch (step) {
      case "started":
        return this.startedHandler;
      case "contact_reason":
        return this.contactReasonHandler;
      default:
        return this.startedHandler;
    }
  }
}
