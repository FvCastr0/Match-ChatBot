import { Processor, WorkerHost } from "@nestjs/bullmq"; // Importe WorkerHost!
import { Job } from "bullmq";
import { sendMessage } from "src/shared/utils/sendMessage";
import { CustomerService } from "../customer/customer.service";

@Processor("message-queue")
export class WorkerProcessor extends WorkerHost {
  constructor(private readonly customerService: CustomerService) {
    super();
  }

  override async process(job: Job<any>) {
    const dataMsg = job.data;

    if (job.name !== "new-message") {
      return;
    }

    try {
      const hasCustomer = await this.customerService.findCustomer(dataMsg.id);

      if (!hasCustomer) {
        await this.customerService.createCustomer(
          dataMsg.id,
          dataMsg.name,
          dataMsg.phone
        );
      }

      sendMessage(dataMsg.phone, "business_redirect");

      console.log(`Job ${job.id} processado com sucesso.`);
    } catch (error) {
      console.error(`Falha ao processar job ${job.id}:`, error);
      throw error;
    }
  }
}
