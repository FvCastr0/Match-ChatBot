import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/modules/user/user.service";
import { AuthRepository } from "src/repositories/auth.repository";

@Injectable()
export class AuthService extends AuthRepository {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService
  ) {
    super();
  }

  async validateUser(name: string, password: string) {
    return await this.userService.findAndVerifyPassword(name, password);
  }

  generateToken(user: any) {
    const payload = {
      sub: user.id,
      name: user.name
    };

    return this.jwtService.sign(payload);
  }
}
