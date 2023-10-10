import { atom } from "jotai";

export const recorderAtom = atom({
  isRecording: false,
  status: "Recording in progress...",
  shouldUpdateText: false,
});