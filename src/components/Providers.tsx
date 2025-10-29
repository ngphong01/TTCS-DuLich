"use client";
import { ReactNode } from "react";
import { SimpleAuthProvider } from "@/lib/use-simple-auth";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  );
}