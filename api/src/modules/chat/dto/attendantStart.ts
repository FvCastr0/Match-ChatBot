import { ContactReason } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class AttendantStartDto {
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  name?: string;

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
