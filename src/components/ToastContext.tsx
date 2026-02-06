"use client";
import React, { createContext, useContext, useState } from "react";
import Toast from "./Toast";

let idCounter = 0;

type ToastItem = {
  id: number;
  type: string;
  message: string;
  position: string; // This should always be the CSS class string
};

type ToastContextType = {
  addToast: (type: string, message: string, position?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: string, message: string, position: string = 'bottom-right') => {
    const id = ++idCounter;

    // Convert position to Tailwind classes
    let positionClass: string;
    switch (position) {
      case "top":
      case "top-right":
        positionClass = "top-4 right-4";
        break;
      case "bottom":
      case "bottom-right":
        positionClass = "bottom-4 right-4";
        break;
      case "top-left":
        positionClass = "top-4 left-4";
        break;
      case "bottom-left":
        positionClass = "bottom-4 left-4";
        break;
      default:
        positionClass = "bottom-4 right-4";
    }

    setToasts((prev) => [...prev, {
      id,
      type,
      message,
      position: positionClass
    }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    // Optional: Return cleanup function if you want to allow manual dismissal
    return () => clearTimeout(timer);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`fixed ${toast.position} z-[999]`}
          >
            <Toast
              type={toast.type as "success" | "error" | "warning" | "info"}
              message={toast.message}
              onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          </div>
        ))}
      </>
    </ToastContext.Provider>
  );
};
