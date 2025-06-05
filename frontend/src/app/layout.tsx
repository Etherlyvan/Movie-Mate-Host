// frontend/src/app/layout.tsx - Quick fix version
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovieMate - Track Your Favorite Movies",
  description:
    "Discover, track, and rate your favorite movies with personalized recommendations.",
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico", // Use favicon.ico as fallback
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ServiceWorkerProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
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
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
