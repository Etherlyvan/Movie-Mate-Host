// frontend/src/app/settings/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/Button";
import {
  User as UserIcon,
  Bell,
  Shield,
  Eye,
  Monitor,
  Globe,
  Palette,
  Save,
  X,
  Check,
  AlertTriangle,
  Lock,
  Mail,
  Smartphone,
  Download,
  Trash2,
  Camera,
  Upload,
  Key,
  LogOut,
  HelpCircle,
  Grid,
  List,
} from "lucide-react";
import { UserPreferences, UserProfile } from "@/types";
import { toast } from "react-hot-toast";

type SettingsSection =
  | "profile"
  | "preferences"
  | "notifications"
  | "privacy"
  | "security"
  | "account";

interface SettingsFormData {
  profile: Partial<UserProfile>;
  preferences: Partial<UserPreferences>;
}

interface ValidationErrors {
  [key: string]: string;
}

const SettingsPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const { user, updateProfile, updatePreferences, updateAvatar, isLoading } =
    useUserStore();

  // State management
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [formData, setFormData] = useState<SettingsFormData>({
    profile: {},
    preferences: {},
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when user data is available
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
          socialLinks: {
            twitter: user.profile?.socialLinks?.twitter || "",
            instagram: user.profile?.socialLinks?.instagram || "",
            facebook: user.profile?.socialLinks?.facebook || "",
          },
        },
        preferences: {
          theme: user.preferences?.theme || "dark",
          language: user.preferences?.language || "en",
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            newReleases: user.preferences?.notifications?.newReleases ?? true,
            recommendations:
              user.preferences?.notifications?.recommendations ?? true,
          },
          privacy: {
            showProfile: user.preferences?.privacy?.showProfile ?? true,
            showWatchlist: user.preferences?.privacy?.showWatchlist ?? true,
            showActivity: user.preferences?.privacy?.showActivity ?? true,
          },
          display: {
            moviesPerPage: user.preferences?.display?.moviesPerPage || 20,
            defaultView: user.preferences?.display?.defaultView || "grid",
          },
        },
      });
      setIsInitialized(true);
    }
  }, [user, isAuthenticated, isInitialized]);

  // Form validation
  const validateForm = useCallback(
    (section: SettingsSection, data: any): ValidationErrors => {
      const errors: ValidationErrors = {};

      if (section === "profile") {
        if (data.displayName && data.displayName.length > 50) {
          errors.displayName = "Display name must be less than 50 characters";
        }
        if (data.bio && data.bio.length > 500) {
          errors.bio = "Bio must be less than 500 characters";
        }
        if (data.website && !isValidUrl(data.website)) {
          errors.website = "Please enter a valid URL";
        }
      }

      return errors;
    },
    []
  );

  // Form update handlers
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
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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

  // Save settings
  const saveSettings = useCallback(
    async (section: SettingsSection) => {
      if (!user) return;

      const errors = validateForm(
        section,
        formData[section === "profile" ? "profile" : "preferences"]
      );

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Please fix validation errors");
        return;
      }

      setIsSaving(true);
      setValidationErrors({});

      try {
        if (section === "profile") {
          await updateProfile(formData.profile);
          toast.success("Profile updated successfully");
        } else {
          await updatePreferences(formData.preferences);
          toast.success("Preferences updated successfully");
        }

        setHasUnsavedChanges(false);
      } catch (error: any) {
        console.error("Save settings error:", error);
        toast.error(error.response?.data?.message || "Failed to save settings");
      } finally {
        setIsSaving(false);
      }
    },
    [user, formData, validateForm, updateProfile, updatePreferences]
  );

  // Avatar upload handler
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

  // Memoized sections configuration
  const settingsSections = useMemo(
    () =>
      [
        { id: "profile", label: "Profile", icon: UserIcon },
        { id: "preferences", label: "Preferences", icon: Palette },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy", icon: Shield },
        { id: "security", label: "Security", icon: Lock },
        { id: "account", label: "Account", icon: Key },
      ] as const,
    []
  );

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
        <SettingsHeader hasUnsavedChanges={hasUnsavedChanges} />

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <SettingsSidebar
            sections={settingsSections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            hasUnsavedChanges={hasUnsavedChanges}
          />

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              {/* Section Content */}
              {activeSection === "profile" && (
                <ProfileSettings
                  formData={formData.profile}
                  user={user}
                  validationErrors={validationErrors}
                  onUpdate={updateFormData}
                  onNestedUpdate={updateNestedFormData}
                  onAvatarUpload={handleAvatarUpload}
                  onSave={() => saveSettings("profile")}
                  isSaving={isSaving}
                />
              )}

              {activeSection === "preferences" && (
                <PreferencesSettings
                  formData={formData.preferences}
                  validationErrors={validationErrors}
                  onUpdate={updateFormData}
                  onNestedUpdate={updateNestedFormData}
                  onSave={() => saveSettings("preferences")}
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

              {activeSection === "privacy" && (
                <PrivacySettings
                  formData={formData.preferences}
                  onNestedUpdate={updateNestedFormData}
                  onSave={() => saveSettings("privacy")}
                  isSaving={isSaving}
                />
              )}

              {activeSection === "security" && <SecuritySettings user={user} />}

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

// Settings Header Component
const SettingsHeader: React.FC<{ hasUnsavedChanges: boolean }> = ({
  hasUnsavedChanges,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <p className="text-gray-400 mt-1">
        Manage your account preferences and privacy settings
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
);

// Settings Sidebar Component
const SettingsSidebar: React.FC<{
  sections: readonly { id: string; label: string; icon: any }[];
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  hasUnsavedChanges: boolean;
}> = ({ sections, activeSection, onSectionChange, hasUnsavedChanges }) => {
  const handleSectionChange = useCallback(
    (sectionId: string) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave this section?"
        );
        if (!confirmed) return;
      }
      onSectionChange(sectionId as SettingsSection);
    },
    [hasUnsavedChanges, onSectionChange]
  );

  return (
    <nav className="space-y-2">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <Button
            key={section.id}
            variant={isActive ? "primary" : "ghost"}
            size="md"
            onClick={() => handleSectionChange(section.id)}
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
  );
};

// Profile Settings Component
const ProfileSettings: React.FC<{
  formData: Partial<UserProfile>;
  user: any;
  validationErrors: ValidationErrors;
  onUpdate: (
    section: keyof SettingsFormData,
    field: string,
    value: any
  ) => void;
  onNestedUpdate: (
    section: keyof SettingsFormData,
    parentField: string,
    field: string,
    value: any
  ) => void;
  onAvatarUpload: (file: File) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({
  formData,
  user,
  validationErrors,
  onUpdate,
  onNestedUpdate,
  onAvatarUpload,
  onSave,
  isSaving,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onAvatarUpload(file);
      }
    },
    [onAvatarUpload]
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <p className="text-gray-400 text-sm mt-1">
            Update your personal information and profile details
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
              variant="ghost"
              size="md"
              icon={Camera}
              iconOnly
              ariaLabel="Change profile picture"
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="sr-only">Change profile picture</span>
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
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Display Name"
            value={formData.displayName || ""}
            onChange={(value) => onUpdate("profile", "displayName", value)}
            error={validationErrors.displayName}
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
              error={validationErrors.website}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Bio"
              value={formData.bio || ""}
              onChange={(value) => onUpdate("profile", "bio", value)}
              error={validationErrors.bio}
              placeholder="Tell us about yourself..."
              multiline
              rows={4}
            />
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Twitter"
              value={formData.socialLinks?.twitter || ""}
              onChange={(value) =>
                onNestedUpdate("profile", "socialLinks", "twitter", value)
              }
              placeholder="@username"
            />

            <FormField
              label="Instagram"
              value={formData.socialLinks?.instagram || ""}
              onChange={(value) =>
                onNestedUpdate("profile", "socialLinks", "instagram", value)
              }
              placeholder="@username"
            />

            <FormField
              label="Facebook"
              value={formData.socialLinks?.facebook || ""}
              onChange={(value) =>
                onNestedUpdate("profile", "socialLinks", "facebook", value)
              }
              placeholder="Profile URL"
            />
          </div>
        </div>

        {/* Favorite Genres */}
        <GenreSelector
          selectedGenres={formData.favoriteGenres || []}
          onChange={(genres) => onUpdate("profile", "favoriteGenres", genres)}
        />
      </div>
    </div>
  );
};

// Preferences Settings Component
const PreferencesSettings: React.FC<{
  formData: Partial<UserPreferences>;
  validationErrors: ValidationErrors;
  onUpdate: (
    section: keyof SettingsFormData,
    field: string,
    value: any
  ) => void;
  onNestedUpdate: (
    section: keyof SettingsFormData,
    parentField: string,
    field: string,
    value: any
  ) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({
  formData,
  validationErrors,
  onUpdate,
  onNestedUpdate,
  onSave,
  isSaving,
}) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">Preferences</h2>
        <p className="text-gray-400 text-sm mt-1">
          Customize your app experience
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

    <div className="space-y-8">
      {/* Theme Settings */}
      <SettingsSection
        title="Appearance"
        description="Customize how the app looks and feels"
        icon={<Palette className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <SelectField
            label="Theme"
            value={formData.theme || "dark"}
            onChange={(value) => onUpdate("preferences", "theme", value)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "auto", label: "Auto (System)" },
            ]}
          />

          <SelectField
            label="Language"
            value={formData.language || "en"}
            onChange={(value) => onUpdate("preferences", "language", value)}
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Spanish" },
              { value: "fr", label: "French" },
              { value: "de", label: "German" },
            ]}
          />
        </div>
      </SettingsSection>

      {/* Display Settings */}
      <SettingsSection
        title="Display"
        description="Control how content is displayed"
        icon={<Monitor className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ViewToggleField
            label="Default View"
            value={formData.display?.defaultView || "grid"}
            onChange={(value) =>
              onNestedUpdate("preferences", "display", "defaultView", value)
            }
          />

          <SelectField
            label="Movies Per Page"
            value={formData.display?.moviesPerPage?.toString() || "20"}
            onChange={(value) =>
              onNestedUpdate(
                "preferences",
                "display",
                "moviesPerPage",
                parseInt(value)
              )
            }
            options={[
              { value: "10", label: "10 movies" },
              { value: "20", label: "20 movies" },
              { value: "30", label: "30 movies" },
              { value: "50", label: "50 movies" },
            ]}
          />
        </div>
      </SettingsSection>
    </div>
  </div>
);

// View Toggle Field Component using Button
const ViewToggleField: React.FC<{
  label: string;
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <div className="flex space-x-2">
      <Button
        variant={value === "grid" ? "primary" : "outline"}
        size="sm"
        icon={Grid}
        onClick={() => onChange("grid")}
        ariaLabel="Grid view"
      >
        Grid
      </Button>
      <Button
        variant={value === "list" ? "primary" : "outline"}
        size="sm"
        icon={List}
        onClick={() => onChange("list")}
        ariaLabel="List view"
      >
        List
      </Button>
    </div>
  </div>
);

// Notification Settings Component
const NotificationSettings: React.FC<{
  formData: Partial<UserPreferences>;
  onNestedUpdate: (
    section: keyof SettingsFormData,
    parentField: string,
    field: string,
    value: any
  ) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({ formData, onNestedUpdate, onSave, isSaving }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">Notifications</h2>
        <p className="text-gray-400 text-sm mt-1">
          Control when and how you receive notifications
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

    <div className="space-y-8">
      {/* Email Notifications */}
      <SettingsSection
        title="Email Notifications"
        description="Receive updates via email"
        icon={<Mail className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ToggleField
            label="Email Notifications"
            description="Receive general email notifications"
            checked={formData.notifications?.email ?? true}
            onChange={(checked) =>
              onNestedUpdate("preferences", "notifications", "email", checked)
            }
          />

          <ToggleField
            label="New Releases"
            description="Get notified about new movie releases"
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
            label="Recommendations"
            description="Receive personalized movie recommendations"
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
        </div>
      </SettingsSection>

      {/* Push Notifications */}
      <SettingsSection
        title="Push Notifications"
        description="Real-time notifications in your browser"
        icon={<Smartphone className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ToggleField
            label="Push Notifications"
            description="Receive push notifications in your browser"
            checked={formData.notifications?.push ?? true}
            onChange={(checked) =>
              onNestedUpdate("preferences", "notifications", "push", checked)
            }
          />
        </div>
      </SettingsSection>
    </div>
  </div>
);

// Privacy Settings Component
const PrivacySettings: React.FC<{
  formData: Partial<UserPreferences>;
  onNestedUpdate: (
    section: keyof SettingsFormData,
    parentField: string,
    field: string,
    value: any
  ) => void;
  onSave: () => void;
  isSaving: boolean;
}> = ({ formData, onNestedUpdate, onSave, isSaving }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">Privacy Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Control what information is visible to others
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

    <div className="space-y-8">
      <SettingsSection
        title="Profile Visibility"
        description="Control what others can see about your profile"
        icon={<Eye className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ToggleField
            label="Show Profile"
            description="Make your profile visible to other users"
            checked={formData.privacy?.showProfile ?? true}
            onChange={(checked) =>
              onNestedUpdate("preferences", "privacy", "showProfile", checked)
            }
          />

          <ToggleField
            label="Show Watchlist"
            description="Allow others to see your watchlist"
            checked={formData.privacy?.showWatchlist ?? true}
            onChange={(checked) =>
              onNestedUpdate("preferences", "privacy", "showWatchlist", checked)
            }
          />

          <ToggleField
            label="Show Activity"
            description="Display your recent activity to others"
            checked={formData.privacy?.showActivity ?? true}
            onChange={(checked) =>
              onNestedUpdate("preferences", "privacy", "showActivity", checked)
            }
          />
        </div>
      </SettingsSection>
    </div>
  </div>
);

// Security Settings Component
const SecuritySettings: React.FC<{ user: any }> = ({ user }) => (
  <div className="p-6">
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white">Security</h2>
      <p className="text-gray-400 text-sm mt-1">
        Manage your account security settings
      </p>
    </div>

    <div className="space-y-8">
      <SettingsSection
        title="Password"
        description="Change your account password"
        icon={<Lock className="h-5 w-5" />}
      >
        <Button variant="primary" size="md" icon={Key}>
          Change Password
        </Button>
      </SettingsSection>

      <SettingsSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Two-Factor Authentication</p>
            <p className="text-gray-400 text-sm">Not enabled</p>
          </div>
          <Button variant="primary" size="md">
            Enable
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Login Sessions"
        description="Manage your active login sessions"
        icon={<Monitor className="h-5 w-5" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Current Session</p>
              <p className="text-gray-400 text-sm">
                Chrome on Windows • Active now
              </p>
            </div>
            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
              Current
            </span>
          </div>
        </div>
      </SettingsSection>
    </div>
  </div>
);

// Account Settings Component
const AccountSettings: React.FC<{
  user: any;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      onLogout();
    }
  }, [onLogout]);

  const handleDeleteAccount = useCallback(() => {
    toast.error("Account deletion is not implemented yet");
    setShowDeleteConfirm(false);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Account</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-8">
        <SettingsSection
          title="Account Information"
          description="View your account details"
          icon={<UserIcon className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Username</span>
              <span className="text-white">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
              <span className="text-white">
                {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Data Export"
          description="Download your data"
          icon={<Download className="h-5 w-5" />}
        >
          <Button variant="primary" size="md" icon={Download}>
            Export Data
          </Button>
        </SettingsSection>

        <SettingsSection
          title="Sign Out"
          description="Sign out of your account"
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
          title="Delete Account"
          description="Permanently delete your account and all data"
          icon={<Trash2 className="h-5 w-5 text-red-500" />}
        >
          <Button
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        </SettingsSection>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
            </div>

            <p className="text-gray-300 mb-6">
              This action cannot be undone. This will permanently delete your
              account and all associated data.
            </p>

            <div className="flex space-x-3">
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Account
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility Components
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

const FormField: React.FC<{
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}> = ({
  label,
  value,
  onChange,
  error,
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
        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? "border-red-500" : "border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label id={`select-label-${label.replace(/\s+/g, "-").toLowerCase()}`} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <select
      aria-labelledby={`select-label-${label.replace(/\s+/g, "-").toLowerCase()}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ToggleField: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => {
  const toggleId = `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-center justify-between">
      <div id={`${toggleId}-label`}>
        <h4 className="text-white font-medium">{label}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      <Button
        onClick={() => onChange(!checked)}
        aria-labelledby={`${toggleId}-label`}
        aria-pressed={checked}
        role="switch"
        title={`${checked ? "Disable" : "Enable"} ${label}`}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
          checked ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        <span className="sr-only">
          {checked ? "Disable" : "Enable"} {label}
        </span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </Button>
    </div>
  );
};

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
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "TV Movie",
    "Thriller",
    "War",
    "Western",
  ];

  const toggleGenre = useCallback(
    (genre: string) => {
      const newGenres = selectedGenres.includes(genre)
        ? selectedGenres.filter((g) => g !== genre)
        : [...selectedGenres, genre];
      onChange(newGenres);
    },
    [selectedGenres, onChange]
  );

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">Favorite Genres</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);

          return (
            <Button
              key={genre}
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleGenre(genre)}
              ariaLabel={`${
                isSelected ? "Remove" : "Add"
              } ${genre} from favorite genres`}
              className="justify-center"
            >
              {genre}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

// Loading Skeleton
const SettingsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-2 w-1/4"></div>
        <div className="h-4 bg-gray-700 rounded mb-8 w-1/3"></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded-lg"></div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-700 rounded-xl p-6">
              <div className="h-6 bg-gray-600 rounded mb-4 w-1/3"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
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
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default SettingsPage;
