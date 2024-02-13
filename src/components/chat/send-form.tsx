import { useEnsureRegeneratorRuntime } from "@/app/hooks/useEnsureRegeneratorRuntime";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";
import { Grid } from "react-loader-spinner";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { MicIcon } from "../icons/mic-icon";
import { XIcon } from "../icons/x-icon";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

interface SendForm {
  input: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function SendForm({
  input,
  handleSubmit,
  isLoading,
  handleInputChange,
}: SendForm) {
  useEnsureRegeneratorRuntime();

  const textareaRef = useRef(null);
  const {
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    transcript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        description: "Your browser does not support speech recognition",
      });
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (listening) {
      const textarea = document.querySelector(".mendable-textarea");
      if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [listening, input]);

  // This listener stops the speech recognition when the tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && listening) {
        SpeechRecognition.stopListening();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [listening]);

  useEffect(() => {
    if (transcript) {
      updateInputWithTranscript(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const updateInputWithTranscript = (transcriptValue: string) => {
    const fakeEvent: any = {
      target: { value: transcriptValue },
    };
    handleInputChange(fakeEvent);
  };

  function toggleSpeech() {
    if (listening) {
      SpeechRecognition.stopListening();
      return;
    } else {
      SpeechRecognition.startListening({ continuous: true });
      return;
    }
  }

  return (
    <form
      onSubmit={(event) => {
        handleSubmit(event);
      }}
      className="flex items-center justify-center w-full space-x-2"
    >
      <div className="relative w-full max-w-xs">
        <MicIcon
          onClick={toggleSpeech}
          className={`absolute right-2 h-4 w-4 top-1/2 transform -translate-y-2 ${
            listening ? "text-red-500 scale-125 animate-pulse" : "text-gray-500"
          } dark:text-gray-400 hover:scale-125 cursor-pointer`}
        />
        <XIcon
          onClick={() => {
            updateInputWithTranscript("");
            resetTranscript();
          }}
          className="absolute right-8 h-4 w-4 top-1/2 transform -translate-y-2 text-gray-500 dark:text-gray-400 cursor-pointer hover:scale-125"
        />
        <Textarea
          value={input}
          onChange={handleInputChange}
          className="pr-12 resize-none mendable-textarea"
          placeholder="Type a message..."
          ref={textareaRef}
        />
      </div>

      <Button className="h-full">
        {isLoading ? (
          <div className="flex gap-2 items-center">
            <Grid
              height={12}
              width={12}
              radius={5}
              ariaLabel="grid-loading"
              color="#fff"
              visible={true}
            />
            {"Loading..."}
          </div>
        ) : (
          <div className="flex flex-col w-16">Send</div>
        )}
      </Button>
    </form>
  );
}
