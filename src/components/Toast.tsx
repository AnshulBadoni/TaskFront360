import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({
  type,
  message,
  position = "bottom-right",
  duration = 5000,
  onDismiss,
}: {
  type: "success" | "error" | "warning" | "info";
  message: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  duration?: number;
  onDismiss?: () => void;
}) => {
  const timerRef = useRef<NodeJS.Timeout>();
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const typeStyles = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: <FaCircleCheck className="text-emerald-600 dark:text-emerald-400" />,
      title: "text-emerald-800 dark:text-emerald-100",
      text: "text-emerald-600 dark:text-emerald-300",
      progress: "bg-emerald-500",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-900/30",
      border: "border-rose-200 dark:border-rose-800",
      icon: <MdError className="text-rose-600 dark:text-rose-400" />,
      title: "text-rose-800 dark:text-rose-100",
      text: "text-rose-600 dark:text-rose-300",
      progress: "bg-rose-500",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: <IoWarning className="text-amber-600 dark:text-amber-400" />,
      title: "text-amber-800 dark:text-amber-100",
      text: "text-amber-600 dark:text-amber-300",
      progress: "bg-amber-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: <FaInfoCircle className="text-blue-600 dark:text-blue-400" />,
      title: "text-blue-800 dark:text-blue-100",
      text: "text-blue-600 dark:text-blue-300",
      progress: "bg-blue-500",
    },
  };

  useEffect(() => {
    if (duration && onDismiss) {
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: position.includes("right") ? 100 : -100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed ${positionClasses[position]} z-50 max-w-md w-full shadow-lg rounded-lg overflow-hidden`}
      >
        <div
          className={`flex items-start p-4 border ${typeStyles[type].bg} ${typeStyles[type].border} rounded-lg`}
        >
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-6 w-6">{typeStyles[type].icon}</div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${typeStyles[type].title}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className={`mt-1 text-sm ${typeStyles[type].text}`}>{message}</p>
          </div>
        </div>
        {duration && (
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`h-1 ${typeStyles[type].progress}`}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
