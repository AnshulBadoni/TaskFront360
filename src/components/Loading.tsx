import React from "react";

export const Loading = ({
    type = "spinner",
    className = "",
    size = "md",
    fullScreen = false
}) => {
    const sizeClasses: any = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-10 w-10"
    };

    const loaderClasses = `animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${className}`;

    if (type === "spinner") {
        return (
            <div className={`flex items-center justify-center ${fullScreen ? "fixed inset-0 z-50 bg-black/10" : ""}`}>
                <div className={loaderClasses} aria-label="Loading..." />
            </div>
        );
    }

    if (type === "skeleton") {
        return (
            <div className={`space-y-3 ${fullScreen ? "p-4" : ""} ${className}`}>
                <div className="animate-pulse rounded-md bg-gray-200 dark:bg-neutral-700 h-4 w-3/4" />
                <div className="animate-pulse rounded-md bg-gray-200 dark:bg-neutral-700 h-4 w-full" />
                <div className="animate-pulse rounded-md bg-gray-200 dark:bg-neutral-700 h-4 w-5/6" />
            </div>
        );
    }

    if (type === "dots") {
        return (
            <div className={`flex items-center justify-center gap-1 ${fullScreen ? "fixed inset-0 z-50 bg-black/10" : ""}`}>
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-bounce h-2 w-2 rounded-full bg-current"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
        );
    }

    return null;
};

export const LoadingOverlay = ({ children, isLoading, overlay = "blur" }: { children: React.ReactNode, isLoading: boolean, overlay?: "blur" | "dark" }) => {
    if (!isLoading) return children;

    return (
        <div className="relative">
            {children}
            <div className={`
        absolute inset-0 flex items-center justify-center
        ${overlay === "blur" ? "backdrop-blur-sm bg-white/30 dark:bg-neutral-800/30" : ""}
        ${overlay === "dark" ? "bg-black/20 dark:bg-black/40" : ""}
      `}>
                <Loading type="spinner" size="lg" />
            </div>
        </div>
    );
};
