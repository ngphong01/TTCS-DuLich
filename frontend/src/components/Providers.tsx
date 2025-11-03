import { ReactNode } from "react";
import React from "react";
import { SimpleAuthProvider } from "../lib/use-simple-auth";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  );
}