// frontend/src/app/layout.tsx - MINIMAL VERSION
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Movie Tracker</title>
        <meta
          name="description"
          content="Track and discover your favorite movies"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerProvider />
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
