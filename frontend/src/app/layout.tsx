import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { APP_NAME } from "@/lib/constants";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Track and discover your favorite movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1f2937",
                color: "#fff",
                border: "1px solid #374151",
              },
              success: {
                style: {
                  background: "#065f46",
                  border: "1px solid #059669",
                },
              },
              error: {
                style: {
                  background: "#7f1d1d",
                  border: "1px solid #dc2626",
                },
              },
            }}
          />
        </main>
      </body>
    </html>
  );
}
