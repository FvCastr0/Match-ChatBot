import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getPerfil(@Req() req) {
    return { user: req.user };
  }

  @Post("login")
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.name, body.password);

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    return {
      access_token: this.authService.generateToken(user)
    };
  }
}
