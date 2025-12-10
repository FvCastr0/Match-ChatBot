import { Injectable } from "@nestjs/common";
import { StepHandler } from "src/repositories/queue.repository";
import { AttendantHandler } from "./attendant.handler";
import { ContactReasonHandler } from "./contact-reason.handler";
import { StartedHandler } from "./started.handler";

@Injectable()
export class StepHandlerFactory {
  constructor(
    private readonly startedHandler: StartedHandler,
    private readonly contactReasonHandler: ContactReasonHandler,
    private readonly attendantHandler: AttendantHandler
  ) {}

  getHandler(step: string | null | undefined): StepHandler {
    switch (step) {
      case "started":
        return this.startedHandler;
      case "contact_reason":
        return this.contactReasonHandler;
      case "attendant":
        return this.attendantHandler;
      default:
        return this.startedHandler;
    }
  }
}
