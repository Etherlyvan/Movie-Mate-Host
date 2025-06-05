// frontend/src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/stores/userStore";

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>; // NEW
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, updatePushSubscription, removePushSubscription } =
    useUserStore();

  const VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BPyHEfVaSEggfA0XDLyIer5y9l5rwKJUA0WrOFV4PyAb3A1zOebatkg2zd08XLzCLzgBnuEjwDy6jgsZttW-vlg";

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    checkSubscriptionStatus();
  }, []);

  // NEW: Refresh when user data changes
  useEffect(() => {
    checkSubscriptionStatus();
  }, [user?.pushSubscription]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      const browserSubscribed = !!subscription;
      const userSubscribed = !!user?.pushSubscription;

      console.log("Subscription status:", {
        browserSubscribed,
        userSubscribed,
        user: !!user,
      });

      setIsSubscribed(browserSubscribed && userSubscribed);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setIsSubscribed(false);
    }
  }, [isSupported, user?.pushSubscription]);

  // NEW: Public method to refresh status
  const refreshSubscriptionStatus = useCallback(async () => {
    await checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Notification permission granted!");
        return true;
      } else if (result === "denied") {
        toast.error("Notification permission denied");
        return false;
      } else {
        toast.error("Notification permission dismissed");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  }, [isSupported]);

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    try {
      // NEW: Check for existing subscription first
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      // If already subscribed, unsubscribe first to avoid duplicates
      if (subscription) {
        console.log("Existing subscription found, unsubscribing first...");
        await subscription.unsubscribe();
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionData = subscription.toJSON();

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscriptionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      await updatePushSubscription(subscriptionData);
      setIsSubscribed(true);
      toast.success("Successfully subscribed to push notifications!");
      return true;
    } catch (error: any) {
      console.error("Error subscribing to push notifications:", error);
      toast.error(`Failed to subscribe: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    isSupported,
    permission,
    VAPID_PUBLIC_KEY,
    requestPermission,
    updatePushSubscription,
    API_BASE_URL,
  ]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        const token = localStorage.getItem("token");
        if (token) {
          await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          });
        }
      }

      await removePushSubscription();
      setIsSubscribed(false);
      toast.success("Successfully unsubscribed from push notifications");
      return true;
    } catch (error: any) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to unsubscribe from push notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, removePushSubscription, API_BASE_URL]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!isSubscribed) {
      toast.error("Please subscribe to notifications first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/notifications/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to send test notification"
        );
      }

      toast.success("Test notification sent!");
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      toast.error(`Failed to send test notification: ${error.message}`);
    }
  }, [isSubscribed, API_BASE_URL]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    refreshSubscriptionStatus,
  };
};
