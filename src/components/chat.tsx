"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";
import { Grid } from "react-loader-spinner";
import Bubble from "./chat/bubble";
import { welcomeMessage } from "@/lib/strings";
import { useToast } from "@/components/ui/use-toast";
import { Share } from "lucide-react";

export default function Chat() {
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

  // Create a reference to the scroll area
  const scrollAreaRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when the messages change
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
          onSubmit={handleSubmit}
          className="flex items-center justify-center w-full space-x-2"
        >
          <Input
            placeholder="Type your message"
            value={input}
            onChange={handleInputChange}
          />
          <Button disabled={isLoading}>
            {isLoading ? (
              <div className="flex gap-2 items-center">
                <Grid
                  height={12}
                  width={12}
                  radius={5}
                  ariaLabel="grid-loading"
                  color="#fff"
                  ms-visible={true}
                />
                {"Loading..."}
              </div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
