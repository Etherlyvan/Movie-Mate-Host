// frontend/src/hooks/useNotifications.ts - Update yang diperlukan
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/stores/userStore"; // NEW

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: Get user store methods
  const { user, updatePushSubscription, removePushSubscription } =
    useUserStore();

  const VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BEl62iUYgUivxIkv69yViEuiBIa40HI80NjQoQ1_-qnT7A";

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    checkSubscriptionStatus();
  }, []);

  // NEW: Check both browser subscription and user store
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // Check both browser subscription and user data
      const browserSubscribed = !!subscription;
      const userSubscribed = !!user?.pushSubscription;

      setIsSubscribed(browserSubscribed && userSubscribed);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  }, [isSupported, user?.pushSubscription]);

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
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionData = subscription.toJSON();

      // Send subscription to backend
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
        }/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            subscription: subscriptionData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save subscription to server");
      }

      // NEW: Update user store
      await updatePushSubscription(subscriptionData);

      setIsSubscribed(true);
      toast.success("Successfully subscribed to push notifications!");
      return true;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast.error("Failed to subscribe to push notifications");
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
  ]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
          }/notifications/unsubscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          }
        );
      }

      // NEW: Update user store
      await removePushSubscription();

      setIsSubscribed(false);
      toast.success("Successfully unsubscribed from push notifications");
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to unsubscribe from push notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, removePushSubscription]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!isSubscribed) {
      toast.error("Please subscribe to notifications first");
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
        }/notifications/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    }
  }, [isSubscribed]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};
