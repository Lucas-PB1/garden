"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

/**
 * Component that wraps the application with all necessary React Context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
