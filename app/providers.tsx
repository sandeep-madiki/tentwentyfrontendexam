"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode, ComponentType } from "react";
import type { SessionProviderProps } from "next-auth/react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const SafeSessionProvider =
    SessionProvider as unknown as ComponentType<SessionProviderProps>;

  return <SafeSessionProvider>{children}</SafeSessionProvider>;
}
