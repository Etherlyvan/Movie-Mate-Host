// frontend/src/app/settings/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/Button";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

import {
  User as UserIcon,
  Bell,
  Lock,
  Save,
  AlertTriangle,
  LogOut,
  Trash2,
  Camera,
  Upload,
} from "lucide-react";
import { UserPreferences, UserProfile } from "@/types";
import { toast } from "react-hot-toast";

type SettingsSection = "profile" | "notifications" | "account"; // REMOVED: "privacy"

interface SettingsFormData {
  profile: Partial<UserProfile>;
  preferences: Partial<UserPreferences>;
}

const SettingsPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const { user, updateProfile, updatePreferences, updateAvatar, isLoading } =
    useUserStore();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [formData, setFormData] = useState<SettingsFormData>({
    profile: {},
    preferences: {},
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (user && !isInitialized) {
      setFormData({
        profile: {
          displayName: user.profile?.displayName || "",
          bio: user.profile?.bio || "",
          country: user.profile?.country || "",
          website: user.profile?.website || "",
          favoriteGenres: user.profile?.favoriteGenres || [],
        },
        preferences: {
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            newReleases: user.preferences?.notifications?.newReleases ?? true,
            recommendations:
              user.preferences?.notifications?.recommendations ?? true,
          },
          // REMOVED: privacy settings
        },
      });
      setIsInitialized(true);
    }
  }, [user, isAuthenticated, isInitialized]);

  const updateFormData = useCallback(
    (section: keyof SettingsFormData, field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateNestedFormData = useCallback(
    (
      section: keyof SettingsFormData,
      parentField: string,
      field: string,
      value: any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parentField]: {
            ...(prev[section] as any)[parentField],
            [field]: value,
          },
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const saveSettings = useCallback(
    async (section: SettingsSection) => {
      if (!user) return;

      setIsSaving(true);
      try {
        if (section === "profile") {
          const cleanProfileData: any = {};
          if (formData.profile.displayName?.trim()) {
            cleanProfileData.displayName = formData.profile.displayName.trim();
          }
          if (formData.profile.bio?.trim()) {
            cleanProfileData.bio = formData.profile.bio.trim();
          }
          if (formData.profile.country?.trim()) {
            cleanProfileData.country = formData.profile.country.trim();
          }
          if (formData.profile.website?.trim()) {
            cleanProfileData.website = formData.profile.website.trim();
          }
          if (
            formData.profile.favoriteGenres &&
            formData.profile.favoriteGenres.length > 0
          ) {
            cleanProfileData.favoriteGenres = formData.profile.favoriteGenres;
          }

          await updateProfile(cleanProfileData);
          toast.success("Profile updated successfully");
        } else if (section === "notifications") {
          const cleanPreferencesData: any = {};
          if (formData.preferences.notifications) {
            cleanPreferencesData.notifications =
              formData.preferences.notifications;
          }

          await updatePreferences(cleanPreferencesData);
          toast.success("Notification settings updated successfully");
        }

        setHasUnsavedChanges(false);
      } catch (error: any) {
        console.error("Save settings error:", error);
        toast.error(error.response?.data?.message || "Failed to save settings");
      } finally {
        setIsSaving(false);
      }
    },
    [user, formData, updateProfile, updatePreferences]
  );

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        await updateAvatar(base64);
        toast.success("Avatar updated successfully");
      } catch (error: any) {
        console.error("Avatar upload error:", error);
        toast.error("Failed to update avatar");
      }
    },
    [updateAvatar]
  );

  // UPDATED: Removed privacy section
  const settingsSections = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Lock },
  ] as const;

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (!isInitialized || isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-20">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">
              Manage your account and notification preferences
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                You have unsaved changes
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <Button
                  key={section.id}
                  variant={isActive ? "primary" : "ghost"}
                  size="md"
                  onClick={() =>
                    setActiveSection(section.id as SettingsSection)
                  }
                  className={`w-full justify-start ${
                    isActive ? "" : "text-gray-300 hover:text-white"
                  }`}
                  icon={Icon}
                >
                  {section.label}
                </Button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              {activeSection === "profile" && (
                <ProfileSettings
                  formData={formData.profile}
                  user={user}
                  onUpdate={updateFormData}
                  onAvatarUpload={handleAvatarUpload}
                  onSave={() => saveSettings("profile")}
                  isSaving={isSaving}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationSettings
                  formData={formData.preferences}
                  onNestedUpdate={updateNestedFormData}
                  onSave={() => saveSettings("notifications")}
                  isSaving={isSaving}
                />
              )}

              {/* REMOVED: Privacy Settings */}

              {activeSection === "account" && (
                <AccountSettings user={user} onLogout={logout} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component (Same as before)
const ProfileSettings: React.FC<{
  formData: Partial<UserProfile>;
  user: any;
  onUpdate: (
    section: keyof SettingsFormData,
    field: string,
    value: any
  ) => void;
  onAvatarUpload: (file: File) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({ formData, user, onUpdate, onAvatarUpload, onSave, isSaving }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarUpload(file);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <p className="text-gray-400 text-sm mt-1">
            Update your personal information and movie preferences
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Save}
          onClick={onSave}
          loading={isSaving}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <img
              src={user?.profile?.avatar || "/default-avatar.png"}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-700 group-hover:ring-blue-500 transition-all duration-200"
            />
            <Button
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
            >
              <Camera className="h-6 w-6 text-white" />
            </Button>
          </div>

          <div>
            <h3 className="text-white font-semibold">Profile Picture</h3>
            <p className="text-gray-400 text-sm mt-1">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={handleAvatarClick}
              className="mt-2"
            >
              Upload new
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            title="Upload profile picture"
            placeholder="Upload profile picture"
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Display Name"
            value={formData.displayName || ""}
            onChange={(value) => onUpdate("profile", "displayName", value)}
            placeholder="How you want to be displayed"
          />

          <FormField
            label="Username"
            value={user?.username || ""}
            disabled
            placeholder="Username cannot be changed"
          />

          <FormField
            label="Email"
            value={user?.email || ""}
            disabled
            placeholder="Email cannot be changed here"
          />

          <FormField
            label="Country"
            value={formData.country || ""}
            onChange={(value) => onUpdate("profile", "country", value)}
            placeholder="Your country"
          />

          <div className="md:col-span-2">
            <FormField
              label="Website"
              value={formData.website || ""}
              onChange={(value) => onUpdate("profile", "website", value)}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Bio"
              value={formData.bio || ""}
              onChange={(value) => onUpdate("profile", "bio", value)}
              placeholder="Tell us about yourself and your movie preferences..."
              multiline
              rows={4}
            />
          </div>
        </div>

        {/* Favorite Genres */}
        <div>
          <GenreSelector
            selectedGenres={formData.favoriteGenres || []}
            onChange={(genres) => onUpdate("profile", "favoriteGenres", genres)}
          />
        </div>
      </div>
    </div>
  );
};

// Account Settings Component - Enhanced
const AccountSettings: React.FC<{
  user: any;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Account Management</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account settings and security
        </p>
      </div>

      <div className="space-y-8">
        <SettingsSection
          title="Account Information"
          description="View your account details"
          icon={<UserIcon className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Username</div>
                <div className="text-white font-medium">{user?.username}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-white font-medium">{user?.email}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Member since</div>
                <div className="text-white font-medium">
                  {new Date(user?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Last login</div>
                <div className="text-white font-medium">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Not available"}
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Security"
          description="Manage your account security"
          icon={<Lock className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => toast("Password change feature coming soon")}
              className="w-full sm:w-auto"
            >
              Change Password
            </Button>
            <p className="text-sm text-gray-400">
              Update your password to keep your account secure
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Sign Out"
          description="Sign out of your account on this device"
          icon={<LogOut className="h-5 w-5" />}
        >
          <Button
            variant="secondary"
            size="md"
            icon={LogOut}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </SettingsSection>

        <SettingsSection
          title="Danger Zone"
          description="Irreversible and destructive actions"
          icon={<Trash2 className="h-5 w-5 text-red-500" />}
        >
          <div className="space-y-4">
            <Button
              variant="danger"
              size="md"
              icon={Trash2}
              onClick={() =>
                toast.error("Account deletion feature coming soon")
              }
            >
              Delete Account
            </Button>
            <p className="text-sm text-gray-400">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

// Utility Components (Same as before)
const FormField: React.FC<{
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  multiline,
  rows = 3,
}) => {
  const Component = multiline ? "textarea" : "input";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <Component
        type={multiline ? undefined : "text"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
};

const SettingsSection: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <div className="border-b border-gray-700/50 pb-8 last:border-b-0">
    <div className="flex items-start mb-4">
      <div className="p-2 bg-blue-600/20 rounded-lg mr-4">{icon}</div>
      <div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
    <div className="ml-14">{children}</div>
  </div>
);

const GenreSelector: React.FC<{
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}> = ({ selectedGenres, onChange }) => {
  const availableGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 5) {
      onChange([...selectedGenres, genre]);
    } else {
      toast.error("You can only select up to 5 favorite genres");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Favorite Genres</h3>
        <span className="text-sm text-gray-400">
          {selectedGenres.length}/5 selected
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Select your favorite movie genres to get better recommendations
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          const isDisabled = !isSelected && selectedGenres.length >= 5;

          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              disabled={isDisabled}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : isDisabled
                  ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SettingsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-2 w-1/4"></div>
        <div className="h-4 bg-gray-700 rounded mb-8 w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <div className="bg-gray-700 rounded-xl p-6">
              <div className="h-6 bg-gray-600 rounded mb-4 w-1/3"></div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Utility Functions
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default SettingsPage;
