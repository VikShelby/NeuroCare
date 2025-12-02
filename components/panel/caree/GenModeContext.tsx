"use client";
import React, { createContext, useContext, useState } from "react";

export type AssistantMode =
  | "voice-assistant"
  | "social-communication-coach"
  | "expression-speech-support"
  | "aac-communication";

interface GenModeState {
  mode: AssistantMode;
  setMode: (m: AssistantMode) => void;
}

const GenModeContext = createContext<GenModeState | undefined>(undefined);

export function GenModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AssistantMode>("voice-assistant");

  return (
    <GenModeContext.Provider value={{ mode, setMode }}>
      {children}
    </GenModeContext.Provider>
  );
}

export function useGenMode() {
  const ctx = useContext(GenModeContext);
  if (!ctx) throw new Error("useGenMode must be used within GenModeProvider");
  return ctx;
}
