type MessageBubbleProps = {
  text: string;
  createdAt: string;
  isSender: boolean;
};

export default function MessageBubble({
  text,
  isSender,
  createdAt
}: MessageBubbleProps) {
  const alignment = isSender ? "self-end" : "self-start";
  const bubbleColor = isSender ? "bg-blue-900" : "bg-slate-700";

  return (
    <div
      className={`
        ${alignment}
        ${bubbleColor}
        text-white rounded-lg p-2 max-w-[50%] flex flex-col shadow-md
      `}
    >
      <p className="text-white text-base">{text}</p>

      <div className="flex justify-end items-center self-end mt-1">
        <p className="text-xs text-zinc-300 mr-1">{createdAt}</p>
      </div>
    </div>
  );
}
