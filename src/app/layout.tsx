  import type { Metadata } from "next";
  import { Inter } from "next/font/google";
  import "./globals.css";
  import { ToastProvider } from "@/components/ToastContext";
  import { LoadingProvider } from "@/components/LoadingContext";
  import { SocketProvider } from "@/components/SocketContext";

  const inter = Inter({ subsets: ["latin"] });

  export const metadata: Metadata = {
    title: "Task360",
    description: "Collaborate and more",
    icons: {
      icon: "/next.svg",
    },
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" className="">
        <body className={inter.className}>
          <LoadingProvider>
            <ToastProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </ToastProvider>
          </LoadingProvider>
        </body>
      </html>
    );
  }
