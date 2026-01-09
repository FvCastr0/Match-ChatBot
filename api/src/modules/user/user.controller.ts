import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userSerivce: UserService) {}

  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  @Get()
  async getUsers(@Res() res: Response) {
    try {
      const users = await this.userSerivce.returnAllUsers();
      return res.status(200).send(users);
    } catch (e) {
      return res.status(500).send({ msg: "Internal error" });
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post("create")
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const create = await this.userSerivce.create({
        user: createUserDto.user,
        password: createUserDto.password,
        role: createUserDto.role
      });
      if (create)
        return res.status(201).send({ msg: "Usuário criado com sucesso" });
      else
        return res
          .status(400)
          .send({ msg: "Já existe um usuário com esse nome" });
    } catch (e) {
      return res.status(500).send({ msg: "Internal error" });
    }
  }
}
