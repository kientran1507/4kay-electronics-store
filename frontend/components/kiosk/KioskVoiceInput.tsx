"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const KioskVoiceInput = ({
  isListening,
  supported,
  error,
  onToggle,
}: {
  isListening: boolean;
  supported: boolean;
  error: string;
  onToggle: () => void;
}) => {
  return (
    <div className="relative">
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        disabled={!supported}
        onClick={onToggle}
        title={error || (supported ? "Speak to the kiosk" : "Speech recognition is not supported in this browser. Please test with Chrome or Edge.")}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default KioskVoiceInput;
