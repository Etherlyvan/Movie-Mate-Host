// frontend/src/components/providers/ServiceWorkerProvider.tsx
"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";

export function ServiceWorkerProvider() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
}
