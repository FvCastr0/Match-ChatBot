import { Body, Controller, Get, Param, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { randomUUID } from "crypto";
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
  @Post("create")
  async create(@Res() res: Response, @Body() body: any) {
    try {
      const { name, phone, role } = body;
      const id = randomUUID();
      await this.customerService.createCustomer(id, name, phone, role);
      return res.status(201).send({ message: "Cadastrado com sucesso" });
    } catch (e) {
      return res.status(500).send({ msgs: "Erro ao cadastrar." });
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
