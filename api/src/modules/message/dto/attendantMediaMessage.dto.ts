import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AttendantMediaMessageDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    chatId: string;

    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsString()
    @IsOptional()
    caption?: string;
}
