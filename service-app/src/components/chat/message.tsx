import { Pause, Play } from "lucide-react";
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

  const initialUrl = mediaUrl
    ? mediaUrl.startsWith("https")
      ? mediaUrl
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${mediaUrl}`
    : "";

  const [src, setSrc] = useState(initialUrl);
  const [attempts, setAttempts] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const newUrl = mediaUrl
      ? mediaUrl.startsWith("https")
        ? mediaUrl
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${mediaUrl}`
      : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(newUrl);
    setAttempts(0);
    setIsPlaying(false);
    setCurrent(0);
  }, [mediaUrl]);

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
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  const progress = duration ? (current / duration) * 100 : 0;

  const handleMediaError = (
    e: React.SyntheticEvent<
      HTMLImageElement | HTMLVideoElement | HTMLAudioElement
    >
  ) => {
    const element = e.currentTarget;

    element.onerror = null;

    if (element instanceof HTMLImageElement) {
      element.src = mediaUrl;
    }

    if (element instanceof HTMLVideoElement) {
      element.poster = mediaUrl;
      element.pause();
    }

    if (element instanceof HTMLAudioElement) {
      element.pause();
    }
  };

  return (
    <div
      className={`
           ${alignment}
           ${bubbleColor}
           text-white rounded-lg p-2 max-w-[70%] flex flex-col shadow-md
         `}
    >
      <div>
        {type === "IMAGE" && src && (
          <div className="mb-2 relative w-60 h-60 aspect-square">
            <img
              src={src}
              alt="Imagem enviada"
              className="w-full h-full rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(src, "_blank")}
              onError={handleMediaError}
              loading="lazy"
            />
          </div>
        )}

        {type === "VIDEO" && src && (
          <div className="mb-2 w-60">
            <video
              controls
              className="w-full rounded-md bg-black"
              src={src}
              preload="metadata"
              onError={handleMediaError}
            >
              Seu navegador não suporta vídeos.
            </video>
          </div>
        )}

        {(type === "AUDIO" || type === "VOICE") && src && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-black/20 w-60">
            <audio
              ref={audioRef}
              src={src}
              preload="metadata"
              onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
              onError={handleMediaError}
            />

            <button
              onClick={togglePlay}
              className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
            >
              {isPlaying ? (
                <Pause size={14} className="fill-current" />
              ) : (
                <Play size={14} className="fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div
                className="h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                onClick={e => {
                  if (!audioRef.current || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  audioRef.current.currentTime = percent * duration;
                }}
              >
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-300 mt-1 font-mono">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {text && <p className="text-sm whitespace-pre-wrap">{text}</p>}
      </div>

      <span className="text-[10px] text-gray-300 mt-1 self-end opacity-80">
        {createdAt}
      </span>
    </div>
  );
}
