import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/modules/user/user.service";

describe("Auth service", () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findAndVerifyPassword: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn()
          }
        }
      ]
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("Validate User", () => {
    it("shoul return the result of userService.findAndVerifyPassowrd", async () => {
      const mockResult = { id: 1, name: "Test User" };
      const name = "testUser";
      const password = "123456";

      (userService.findAndVerifyPassword as jest.Mock).mockResolvedValue(
        mockResult
      );

      const result = await authService.validateUser(name, password);

      expect(userService.findAndVerifyPassword).toHaveBeenCalledWith(
        name,
        password
      );
      expect(result).toEqual(mockResult);
    });

    it("should return null if userService returns null", async () => {
      (userService.findAndVerifyPassword as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser("wrong", "wrong");
      expect(result).toBeNull();
    });
  });

  describe("Generate token", () => {
    it("should generate a JWT token with the correct payload", () => {
      const mockUser = { id: "user_123", name: "Test User" };
      const mockToken = "fake_jwt_token_string";

      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = authService.generateToken(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        name: mockUser.name
      });

      expect(result).toEqual(mockToken);
    });
  });
});
