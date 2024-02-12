import { useEnsureRegeneratorRuntime } from "@/app/hooks/useEnsureRegeneratorRuntime";
import { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { Grid } from "react-loader-spinner";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

const SUBMIT_EVENT_DELAY = 500;
const INITIAL_SEND_LOADER_TEXT = "Send";
const RECORDING_START_DELAY = 2000;
const SEND_LOADER_UPDATE_FIRST_DELAY = 750;

export default function SendButton({
  isLoading,
  formRef,
}: {
  isLoading: boolean;
  formRef: React.RefObject<HTMLFormElement>;
}) {
  useEnsureRegeneratorRuntime();
  const [recordTimeout, setRecordTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [sendLoaderText, setSendLoaderText] = useState(
    INITIAL_SEND_LOADER_TEXT
  );

  const { listening, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        description: "Your browser does not support speech recognition",
      });
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (recordTimeout) {
        clearTimeout(recordTimeout);
        setRecordTimeout(null);
        SpeechRecognition.stopListening();
        resetTranscript();
        setSendLoaderText(INITIAL_SEND_LOADER_TEXT);
        if (!isLoading && formRef.current) {
          setTimeout(() => {
            formRef.current?.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }, SUBMIT_EVENT_DELAY);
        }
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isLoading, recordTimeout, formRef, resetTranscript]);

  const handleMouseDown = () => {
    if (!isLoading) {
      setSendLoaderText("Send.");
      setTimeout(
        () => setSendLoaderText("Send.."),
        SEND_LOADER_UPDATE_FIRST_DELAY
      );
      const timeoutId = setTimeout(() => {
        SpeechRecognition.startListening();
      }, RECORDING_START_DELAY);
      setRecordTimeout(timeoutId);
    }
  };

  return (
    <Button
      disabled={isLoading}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
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
      ) : listening ? (
        <div className="flex flex-col text-red-500 w-16 items-center">
          <FaCircle className="text-red-500 text-xs animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col w-16">
          {sendLoaderText}{" "}
          <h5 className="text-[9px] leading-3 whitespace-nowrap">
            (hold to record)
          </h5>
        </div>
      )}
    </Button>
  );
}
