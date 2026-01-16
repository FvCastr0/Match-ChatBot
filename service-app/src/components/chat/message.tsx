import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const fullMediaUrl = `https://api.redematch.com.br/media/${mediaUrl}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrent(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div
      className={`
           ${alignment}
           ${bubbleColor}
           text-white rounded-lg p-2 max-w-[50%] flex flex-col shadow-md
         `}
    >
      <div>
        {type === "IMAGE" && fullMediaUrl && (
          <div className="mb-2 relative w-60 h-60">
            <Image
              src={fullMediaUrl}
              alt="Imagem enviada"
              fill
              className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
              sizes="(max-width: 768px) 100vw, 240px"
              quality={80}
              priority={false}
              onClick={() => window.open(fullMediaUrl, "_blank")}
            />
          </div>
        )}

        {type === "VIDEO" && fullMediaUrl && (
          <div className="mb-2 w-60">
            <video controls className="w-full rounded-md">
              <source src={fullMediaUrl} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        )}

        {type === "AUDIO" && fullMediaUrl && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <audio ref={audioRef} src={fullMediaUrl} />

            <button
              onClick={togglePlay}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <div className="flex-1">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {text && <p className="text-sm whitespace-pre-wrap">{text}</p>}
      </div>

      <span className="text-xs text-gray-400 mt-1">{createdAt}</span>
    </div>
  );
}
