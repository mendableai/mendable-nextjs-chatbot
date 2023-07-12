import { Configuration, OpenAIApi } from "openai-edge";
import { StreamingTextResponse } from "ai";
import { MendableStream } from "@/lib/mendable_stream";

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = "edge";

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});

const openai = new OpenAIApi(apiConfig);

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // question is on the last message
  const question = messages[messages.length - 1].content;
  messages.pop();

  const url = "https://api.mendable.ai/v0/newConversation";

  const data = {
    api_key: process.env.MENDABLE_API_KEY,
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // decode
  const conversation_id = await r.json();

  const history = [];
  for (let i = 0; i < messages.length; i += 2) {
    history.push({
      prompt: messages[i].content,
      response: messages[i + 1].content,
    });
  }

  // push initial prompt to the top  of the history ["hi how can i help you today?""]
  history.unshift({
    prompt: "",
    response: "Hi, how can i help you today?",
  });

  const stream = await MendableStream({
    api_key: process.env.MENDABLE_API_KEY,
    question: question,
    history: history,
    conversation_id: conversation_id,
  });

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
