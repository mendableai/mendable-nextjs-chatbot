import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Popover>
        <PopoverContent align="start" className="w-[440px] mr-4">
          <Chat />
        </PopoverContent>
        <PopoverTrigger asChild className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            className="rounded-full w-16 h-16 aspect-square"
          >
            <MessageCircle size={40} />
          </Button>
        </PopoverTrigger>
      </Popover>
    </div>
  );
}
