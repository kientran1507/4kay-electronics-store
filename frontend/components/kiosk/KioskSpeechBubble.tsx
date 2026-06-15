"use client";

const KioskSpeechBubble = ({ reply }: { reply: string }) => {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="whitespace-pre-line text-sm leading-6 text-gray-800">{reply}</p>
    </div>
  );
};

export default KioskSpeechBubble;
