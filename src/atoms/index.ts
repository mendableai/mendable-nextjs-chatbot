import { atom } from "jotai";

export const sessionIdAtom = atom<string | null>(null);
export const recorderAtom = atom({
  isRecording: false,
  status: "Recording in progress...",
  shouldUpdateText: false,
});