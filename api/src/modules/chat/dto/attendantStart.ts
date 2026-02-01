import { ContactReason } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AttendantStartDto {
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(ContactReason)
  @IsNotEmpty()
  contactReason: ContactReason;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsNotEmpty()
  @IsString()
  order: string;
}
