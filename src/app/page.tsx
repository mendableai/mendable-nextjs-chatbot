import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

export default function Home() {
  return (

    <div className="w-screen h-screen overflow-hidden">

      <AspectRatio ratio={16 / 9}>
        <Image src="/hawana_bg.png" alt="Image" className="rounded-md object-cover" fill={true} />
      </AspectRatio>

      <div className="flex bg-gray-50 min-h-screen items-center justify-center">

        <Popover>
          <PopoverContent align="start" className="w-[500px] mr-4">
            <Chat />
          </PopoverContent>
          <PopoverTrigger asChild className="fixed bottom-4 right-4">
            <Button
              variant="outline"
              className="rounded-full w-16 h-16 aspect-square bg-black hover:bg-gray-700"
            >
              <MessageCircle size={40} className="text-white" />
            </Button>
          </PopoverTrigger>
        </Popover>
      </div>
    </div>

  );
}
