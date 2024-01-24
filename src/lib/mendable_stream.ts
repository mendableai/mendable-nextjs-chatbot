import { AIStream, AIStreamCallbacks } from "ai";

export interface MendableStreamCallbacks extends AIStreamCallbacks {
  onMessage?: (data: string) => Promise<void>;
}

function parseMendableStream(): (data: string) => string | void {
  return (data) => {
    const parsedData = JSON.parse(data);
    const chunk = parsedData.chunk;

    // TODO: handle source and message_id to provide sources to the users
    // More info here: https://docs.mendable.ai/mendable-api/chat
    if (chunk === "<|source|>" || chunk === "<|message_id|>") return;

    if (chunk === "<|tool_called|>") return `<|tool_called|>$$${parsedData.metadata.name}$$${parsedData.metadata.is_action}$$`

    if (chunk) return chunk;
  };
}

export async function MendableStream(
  data: any,
  callbacks?: MendableStreamCallbacks
) {
  const url = "https://api.mendable.ai/v0/mendableChat";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Response error: " + (await response.text()));
  }

  return AIStream(response, parseMendableStream(), callbacks);
}
