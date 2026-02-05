"use client";

import { useGlobalLoading } from "./LoadingContext";
import { Loading } from "@/components/Loading";

export function GlobalLoadingIndicator() {
    const { isLoading } = useGlobalLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <Loading type="spinner" size="xl" />
        </div>
    );
}
