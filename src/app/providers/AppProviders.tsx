import type { ReactNode } from "react";
import { Toaster } from "@/app/components/ui/sonner";
import { InstallPrompt, UpdatePrompt } from "@/app/components/pwa";
import { ErrorBoundary } from "./ErrorBoundary";
import { AuthProvider } from "./AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
        {}
        <Toaster position="top-right" richColors closeButton />
        {}
        <UpdatePrompt />
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}
