"use client";
import { useEnsureRegeneratorRuntime } from "@/app/hooks/useEnsureRegeneratorRuntime";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { welcomeMessage } from "@/lib/strings";
import { useChat } from "ai/react";
import { Share } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import Bubble from "./chat/bubble";
import SendButton from "./chat/send-button";

export default function Chat() {
  const formRef = useRef(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const share = searchParams.get("share");
  //@ts-ignore
  const lzstring = LZString;
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      initialMessages:
        share && lzstring
          ? JSON.parse(lzstring.decompressFromEncodedURIComponent(share))
          : [],
    });
  const { transcript } = useSpeechRecognition();

  useEnsureRegeneratorRuntime();

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
    handleInputChange(fakeEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const scrollAreaRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Card className="w-[440px]">
      <CardHeader>
        <div className="flex flex-row items-start justify-between max-w-[100%]">
          <CardTitle className="text-lg">Chatbot</CardTitle>
          <Share
            onClick={() => {
              if (typeof window !== "undefined") {
                const tmp = new URL(window.location.href);
                tmp.searchParams.set(
                  "share",
                  lzstring.compressToEncodedURIComponent(
                    JSON.stringify(messages)
                  )
                );
                navigator.clipboard.writeText(tmp.toString()).then(() => {
                  toast({
                    description: "Conversation link copied to dashboard",
                  });
                });
              }
            }}
            size={18}
            className="cursor-pointer"
          />
        </div>
        <CardDescription className=" leading-3">
          Powered by Mendable and Vercel
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[450px] overflow-y-auto w-full spacy-y-4 pr-4"
        >
          <Bubble
            message={{
              role: "assistant",
              content: welcomeMessage,
              id: "initialai",
            }}
          />
          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          ref={formRef}
          onSubmit={(event) => {
            handleSubmit(event);
            updateInputWithTranscript("");
          }}
          className="flex items-center justify-center w-full space-x-2"
        >
          <Input
            placeholder="Type your message"
            value={input}
            onChange={handleInputChange}
          />
          <SendButton isLoading={isLoading} formRef={formRef} />
        </form>
      </CardFooter>
    </Card>
  );
}
