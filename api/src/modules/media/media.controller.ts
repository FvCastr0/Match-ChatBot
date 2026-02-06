import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { existsSync } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";

@Controller("media")
export class MediaController {
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        }
      })
    })
  )
  uploadFile(@UploadedFile() file: any) {
    return {
      filename: file.filename
    };
  }

  @Get("/:filename")
  getMedia(@Param("filename") filename: string, @Res() res: Response) {
    const basePath = join(process.cwd(), "uploads");
    const filePath = join(basePath, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException("Arquivo não encontrado");
    }

    return res.sendFile(filePath);
  }
}
