"use client";

import { SessionProvider } from "next-auth/react";
import { GenModeProvider } from "@/components/panel/caree/GenModeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GenModeProvider>{children}</GenModeProvider>
    </SessionProvider>
  );
}
