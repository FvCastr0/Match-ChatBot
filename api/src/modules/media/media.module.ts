import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MediaController } from "./media.controller";

@Module({
  imports: [
    MulterModule.register({
      dest: "./uploads"
    })
  ],
  controllers: [MediaController]
})
export class MediaModule { }
