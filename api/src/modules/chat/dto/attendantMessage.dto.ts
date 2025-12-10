import { IsNotEmpty, IsString } from "class-validator";

export class attendantMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
