// frontend/src/components/notifications/NotificationSettings.tsx
import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { ToggleField } from '@/components/ui/ToggleField';
import {
  Bell,
  BellOff,
  TestTube,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { UserPreferences } from "@/types";

// FIXED: Update interface untuk match dengan settings page
interface NotificationSettingsProps {
  formData: Partial<UserPreferences>;
  onNestedUpdate: (
    section: "preferences",
    parentField: string,
    field: string,
    value: any
  ) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  formData,
  onNestedUpdate,
  onSave,
  isSaving,
}) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = useNotifications();

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      onNestedUpdate("preferences", "notifications", "push", false);
    } else {
      const success = await subscribe();
      if (success) {
        onNestedUpdate("preferences", "notifications", "push", true);
      }
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return { color: "text-green-400", icon: CheckCircle, text: "Granted" };
      case "denied":
        return { color: "text-red-400", icon: AlertCircle, text: "Denied" };
      default:
        return {
          color: "text-yellow-400",
          icon: AlertCircle,
          text: "Not requested",
        };
    }
  };

  const permissionStatus = getPermissionStatus();
  const StatusIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <div className="p-6">
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-400">
              Push notifications are not supported in this browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Push Notifications</h2>
          <p className="text-gray-400 text-sm mt-1">
            Get notified about new movies and updates
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Bell}
          onClick={onSave}
          loading={isSaving}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Permission Status */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Permission Status</h3>
              <div className="flex items-center mt-1">
                <StatusIcon
                  className={`h-4 w-4 ${permissionStatus.color} mr-2`}
                />
                <span className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </span>
              </div>
            </div>

            {permission !== "granted" && (
              <Button
                variant="primary"
                size="sm"
                onClick={requestPermission}
                disabled={permission === "denied"}
              >
                {permission === "denied" ? "Blocked" : "Request Permission"}
              </Button>
            )}
          </div>

          {permission === "denied" && (
            <div className="mt-3 p-3 bg-red-600/20 border border-red-600/30 rounded">
              <p className="text-red-400 text-sm">
                Notifications are blocked. Please enable them in your browser
                settings.
              </p>
            </div>
          )}
        </div>

        {/* Push Notification Toggle */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Push Notifications</h3>
              <p className="text-gray-400 text-sm mt-1">
                Receive push notifications for movie updates
              </p>
            </div>

            <Button
              variant={isSubscribed ? "danger" : "primary"}
              size="sm"
              icon={isSubscribed ? BellOff : Bell}
              onClick={handlePushToggle}
              loading={isLoading}
              disabled={permission !== "granted" || isLoading}
            >
              {isLoading
                ? "Processing..."
                : isSubscribed
                ? "Unsubscribe"
                : "Subscribe"}
            </Button>
          </div>
        </div>

        {/* Test Notification */}
        {isSubscribed && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Test Notification</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Send a test notification to verify everything works
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={TestTube}
                onClick={sendTestNotification}
              >
                Send Test
              </Button>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        {isSubscribed && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Notification Types</h3>

            <div className="space-y-3">
              <ToggleField
                label="Email Notifications"
                description="Receive general email notifications"
                checked={formData.notifications?.email ?? true}
                onChange={(checked) =>
                  onNestedUpdate(
                    "preferences",
                    "notifications",
                    "email",
                    checked
                  )
                }
              />

              <ToggleField
                label="New Movie Releases"
                description="Get notified when new movies are released"
                checked={formData.notifications?.newReleases ?? true}
                onChange={(checked) =>
                  onNestedUpdate(
                    "preferences",
                    "notifications",
                    "newReleases",
                    checked
                  )
                }
              />

              <ToggleField
                label="Personalized Recommendations"
                description="Receive movie recommendations based on your preferences"
                checked={formData.notifications?.recommendations ?? true}
                onChange={(checked) =>
                  onNestedUpdate(
                    "preferences",
                    "notifications",
                    "recommendations",
                    checked
                  )
                }
              />

              <ToggleField
                label="Bookmark Reminders"
                description="Get reminded about movies in your watchlist"
                checked={formData.notifications?.bookmarkReminders ?? false}
                onChange={(checked) =>
                  onNestedUpdate(
                    "preferences",
                    "notifications",
                    "bookmarkReminders",
                    checked
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
