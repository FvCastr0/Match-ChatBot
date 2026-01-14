import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export const getExtension = (mimeType: string | null): string => {
  if (!mimeType) return ".bin";
  const cleanMime = mimeType.split(";")[0].trim();

  const mimeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "audio/ogg": ".ogg",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "text/plain": ".txt"
  };

  return mimeMap[cleanMime] || ".bin";
};

export async function saveMedia(
  mediaUrl: string,
  token: string,
  fileNameBase: string
) {
  try {
    const outputDir = path.resolve(process.cwd(), "uploads");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} - ${response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("O corpo da resposta está vazio (null).");
    }

    const contentType = response.headers.get("content-type");
    const extension = getExtension(contentType);

    const finalPath = path.join(outputDir, `${fileNameBase}${extension}`);

    const nodeStream = Readable.fromWeb(response.body as any);

    await pipeline(nodeStream, fs.createWriteStream(finalPath));

    return finalPath;
  } catch (error) {
    console.error("Falha no download:", error);
    throw error;
  }
}
