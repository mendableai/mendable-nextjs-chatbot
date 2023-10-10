import { NextRequest, NextResponse } from "next/server";
import { convertAudioToText } from "@/speech-to-text";

// Text that gets transcribed when there is nobody speaking in the audio
// help reduce hallucination
const badText = [
  "Subtítulos realizados por la comunidad de Amara.org", // spanish transcription
  "you", // english transcription
  "",
  "Sottotitoli creati dalla comunità Amara.org", // italian transcription
];

// This function handles POST requests to the /api/speechToText route
export async function POST(request: NextRequest) {
  // Parse the request body
  const req = await request.json();
  // Extract the audio data from the request body
  const base64Audio = req.audio;
  const language = req.language;

  // Convert the Base64 audio data back to a Buffer
  const audio = Buffer.from(base64Audio, "base64");
  try {
    // Convert the audio data to text
    const transcribedText = await convertAudioToText(audio, language);

    // If the audio is empty, return an error
    if (badText.some((bad) => transcribedText === bad)) {
      return NextResponse.json(
        { error: "No audio detected. Try again" },
        { status: 500 },
      );
    }

    return NextResponse.json({ text: transcribedText }, { status: 200 });
  } catch (error: any) {
    // Handle any errors that occur during the request
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json({ error: error.response.data }, { status: 500 });
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return NextResponse.json(
        { error: "An error occurred during your request." },
        { status: 500 },
      );
    }
  }
}