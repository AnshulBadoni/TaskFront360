"use client"; // Important for context providers

import { createContext, useContext, useState } from "react";
import { Loading } from "./Loading";

type LoadingContextType = {
    isLoading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const showLoading = () => setIsLoading(true);
    const hideLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
            {children}
            <div className={`fixed z-[99999] bg-black/50 flex items-center justify-center ${isLoading ? "" : "hidden"}`}>
                <div className="absolute inset-0 bg-black/50"></div>
                <Loading type="spinner" size="xl" />
            </div>
        </LoadingContext.Provider>
    );
}

export function useGlobalLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useGlobalLoading must be used within a LoadingProvider");
    }
    return context;
}
