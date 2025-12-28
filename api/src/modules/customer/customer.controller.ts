import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { CustomerService } from "./customer.service";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get("findAll")
  async findChats(@Res() res: Response) {
    try {
      const customers = await this.customerService.findAllCustomers();
      return res.status(200).send(customers);
    } catch (e) {
      return res.status(500).send({ msgs: "Erro no servidor." });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async customerData(@Res() res: Response, @Param("id") id: string) {
    try {
      const customer = await this.customerService.findCustomerData(id);

      return res.status(200).send(customer);
    } catch (e) {
      return res.status(500).send({ msgs: "Erro no servidor." });
    }
  }
}
