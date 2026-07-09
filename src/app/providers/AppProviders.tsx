import type { ReactNode } from "react";
import { Toaster } from "@/app/components/ui/sonner";
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
        {/* App-wide toast host. Trigger toasts via `notify` from @/shared/lib. */}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ErrorBoundary>
  );
}
