"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LazyMotion, ResolvedValues, domAnimation, m } from "framer-motion";
import { Loader2, StopCircle, Mic } from "lucide-react";
import { useAtom } from "jotai";
import { recorderAtom } from "@/atoms";
import { Button } from "./ui/button";
import { isAppleEnvironment } from "@/lib/utils";

interface ComponentProps {
  language: string;
  setInputText: (text: string) => void;
}

export default function RecordingButton(props: ComponentProps) {
  const { language, setInputText } = props;
  const [{ isRecording, status, shouldUpdateText }, setRecordingState] =
    useAtom(recorderAtom);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const loadPolyfill = async () => {
    if (isAppleEnvironment()) {
      //? mobile iOS devices and Safari on mac creates a weird file format that is not supported by openai
      //? so we use a polyfill that creates a support file format when recording is
      const AudioRecorder = (await import("audio-recorder-polyfill")).default;
      console.log("loaded polyfill");
      window.MediaRecorder = AudioRecorder;
      return true;
    }
  };

  // This useEffect hook sets up the media recorder when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("setting up media recorder");
      let chunks: Blob[] = [];
      const initalizeMediaRecorder = async () => {
        // load the polyfill if the browser is safari
        const isPolyfillLoaded = await loadPolyfill();

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const newMediaRecorder = new MediaRecorder(stream);
            newMediaRecorder.addEventListener("start", () => {
              chunks = [];
            });
            newMediaRecorder.addEventListener("dataavailable", (e) => {
              chunks.push(e.data);
            });

            newMediaRecorder.addEventListener("stop", async () => {
              // if polyfill is loaded, use wav format
              const fileType = isPolyfillLoaded ? "audio/wav" : "audio/webm";
              const audioBlob = new Blob(chunks, { type: fileType });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.onerror = (err) => {
                console.error("Error playing audio:", err);
                stopLoading();
              };
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async function () {
                try {
                  if (typeof reader.result !== "string") {
                    stopLoading();
                    throw new Error("Unexpected result type");
                  }
                  // transcribe audio and begin conversation with openai
                  const base64Audio = reader.result.split(",")[1]; // Remove the data URL prefix
                  const response = await fetch("/api/speechToText", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      audio: base64Audio,
                      language,
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok || data.error) {
                    stopLoading();
                    throw new Error(data.error);
                  }

                  const humanResponse = data.text;
                  setInputText(humanResponse);
                  stopLoading();
                } catch (error: any) {
                  console.error(error);
                  stopLoading();
                  toast({
                    description: error.message,
                    variant: "destructive",
                  });
                }
              };
            });
            setMediaRecorder(newMediaRecorder);
          })
          .catch((error: any) => {
            console.error(error);
            stopLoading();
            toast({
              description: "Please allow microphone access to continue",
              variant: "destructive",
            });
          });
      };
      initalizeMediaRecorder();
    }
  }, []);

  // Function to start recording
  const startRecording = () => {
    setRecordingState((prev) => {
      return {
        ...prev,
        isRecording: true,
      };
    });
    if (mediaRecorder) {
      mediaRecorder.start();
    }
  };
  // Function to stop recording
  const stopRecording = () => {
    setRecordingState((prev) => {
      return {
        ...prev,
        isRecording: false,
      };
    });
    if (mediaRecorder) {
      mediaRecorder.stop();
      startLoading();
    }
  };

  function round(value: number, precision: number) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  // This useEffect hook updates the recording text
  useEffect(() => {
    if (shouldUpdateText) {
      setRecordingState((prev) => {
        return {
          ...prev,
          status:
            prev.status === "Click to stop recording"
              ? "Recording in progress..."
              : "Click to stop recording",
        };
      });
    }
  }, [shouldUpdateText]);

  const onUpdateFrame = (latest: ResolvedValues) => {
    const value = round(latest.opacity as number, 2);
    if (value < 0.01) {
      setRecordingState((prev) => {
        return {
          ...prev,
          shouldUpdateText: true,
        };
      });
    }
    if (value > 0.01) {
      setRecordingState((prev) => {
        return {
          ...prev,
          shouldUpdateText: false,
        };
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 text-center justify-center items-center w-12">
      {loading ? (
        <div className="flex flex-col gap-1 items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="text-md w-full relative">
          {isRecording ? (
            <Button onClick={stopRecording} className="w-8 h-8 rounded-full p-0">
              <LazyMotion features={domAnimation}>
                <m.div
                  key="recording"
                  initial={{ opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    repeatType: "reverse",
                  }}
                  animate={{ opacity: 0 }}
                  onUpdate={onUpdateFrame}
                >
                  {status == "Recording in progress..." && (
                    <StopCircle className="h-4 w-4 text-red-500" />
                  )}
                  {status == "Click to stop recording" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </m.div>
              </LazyMotion>
            </Button>
          ) : (
            <Button onClick={startRecording} className="w-8 h-8 rounded-full p-0">
              <Mic className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
