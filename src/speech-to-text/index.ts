// Import necessary libraries
import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI();

/**
 * This function converts audio data to text using the OpenAI API
 * @param audioData string | NodeJS.ArrayBufferView
 * @returns string
 */
export async function convertAudioToText(audioData: Buffer, language: string) {
  //  Write the audio data to a file
  const inputPath = "/tmp/input.webm";
  fs.writeFileSync(inputPath, audioData);

  // Create a read stream from the file
  const file = fs.createReadStream(inputPath);
  // Transcribe the audio
  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language,
  });
  // Delete the temporary files
  fs.unlinkSync(inputPath);
  // The API response contains the transcribed text
  const transcribedText = response.text;
  return transcribedText;
}