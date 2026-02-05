// app/providers.tsx
"use client";

import { LoadingProvider } from "@/components/LoadingContext";
import { ToastProvider } from "@/components/ToastContext";
import { GlobalLoadingIndicator } from "@/components/GlobalLoading";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LoadingProvider>
            <ToastProvider>
                <GlobalLoadingIndicator />
                {children}
            </ToastProvider>
        </LoadingProvider>
    );
}
