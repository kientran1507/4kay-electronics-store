"use client";

const AvatarSpeechBubble = ({ reply }: { reply: string }) => {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Store assistant</p>
      </div>
      <p className="whitespace-pre-line text-base leading-7 text-gray-800">{reply}</p>
    </div>
  );
};

export default AvatarSpeechBubble;
