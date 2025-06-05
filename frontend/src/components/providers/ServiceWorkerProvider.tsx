// frontend/src/components/providers/ServiceWorkerProvider.tsx
"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";

export const ServiceWorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      registerServiceWorker();
    }
  }, []);

  return <>{children}</>;
};
