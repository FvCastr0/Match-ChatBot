import { Controller, Get, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { existsSync } from "fs";
import { extname, join } from "path";

@Controller("media")
export class MediaController {
  @Get("media/:file")
  getMedia(@Param("file") file: string, @Res() res: Response) {
    const filePath = join(process.cwd(), "uploads", file);

    if (!existsSync(filePath)) {
      return res.sendStatus(404);
    }

    const ext = extname(filePath);

    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".mp3": "audio/mpeg",
      ".ogg": "audio/ogg",
      ".wav": "audio/wav",
      ".mp4": "video/mp4"
    };

    res.setHeader("Content-Type", mimeMap[ext] ?? "application/octet-stream");

    return res.sendFile(filePath);
  }
}
