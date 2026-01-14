import Image from "next/image";

type MessageBubbleProps = {
  text: string;
  type: string;
  mediaUrl: string;
  createdAt: string;
  isSender: boolean;
};

export default function MessageBubble({
  text,
  isSender,
  createdAt,
  type,
  mediaUrl
}: MessageBubbleProps) {
  const alignment = isSender ? "self-end" : "self-start";
  const bubbleColor = isSender ? "bg-blue-900" : "bg-slate-700";
  const fullImageUrl = `https://api.redematch.com.br/media/${mediaUrl}`;

  return (
    <div
      className={`
           ${alignment}
           ${bubbleColor}
           text-white rounded-lg p-2 max-w-[50%] flex flex-col shadow-md
         `}
    >
      <div>
        {type === "IMAGE" && fullImageUrl && (
          <div className="mb-2 relative w-60 h-60">
            <Image
              src={fullImageUrl}
              alt="Imagem enviada"
              fill
              className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
              sizes="(max-width: 768px) 100vw, 240px"
              quality={80}
              priority={false}
              onClick={() => window.open(fullImageUrl, "_blank")}
            />
          </div>
        )}

        {type === "VIDEO" && fullImageUrl && (
          <div className="mb-2 w-60">
            <video controls className="w-full rounded-md">
              <source src={fullImageUrl} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        )}

        {text && <p className="text-sm whitespace-pre-wrap">{text}</p>}
      </div>

      <span className="text-xs text-gray-400 mt-1">{createdAt}</span>
    </div>
  );
}
