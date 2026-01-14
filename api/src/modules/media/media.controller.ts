import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { existsSync } from "fs";
import { join } from "path";

@Controller("media")
export class MediaController {
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
