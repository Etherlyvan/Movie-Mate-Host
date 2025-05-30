"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Camera,
  User,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "@/stores/userStore";
import type { EditProfileModalProps } from "./types";
import { Button } from "@/components/ui/Button";

interface ProfileFormData {
  displayName: string;
  bio: string;
  country: string;
  website: string;
  dateOfBirth: string;
  favoriteGenres: string[];
  socialLinks: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

const AVAILABLE_GENRES = [
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

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
}) => {
  const {
    updateProfile,
    uploadAvatar,
    isLoading: storeLoading,
  } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.profile?.avatar || null
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user?.profile?.displayName || user?.username || "",
    bio: user?.profile?.bio || "",
    country: user?.profile?.country || "",
    website: user?.profile?.website || "",
    dateOfBirth: user?.profile?.dateOfBirth
      ? format(new Date(user.profile.dateOfBirth), "yyyy-MM-dd")
      : "",
    favoriteGenres: user?.profile?.favoriteGenres || [],
    socialLinks: {
      twitter: user?.profile?.socialLinks?.twitter || "",
      instagram: user?.profile?.socialLinks?.instagram || "",
      facebook: user?.profile?.socialLinks?.facebook || "",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Form handlers
  const handleInputChange = useCallback(
    (field: keyof ProfileFormData, value: string | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSocialLinkChange = useCallback(
    (platform: keyof ProfileFormData["socialLinks"], value: string) => {
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value,
        },
      }));
    },
    []
  );

  const handleGenreToggle = useCallback((genre: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  }, []);

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: "error",
          message: "File size must be less than 5MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotification({
          type: "error",
          message: "Please select an image file",
        });
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = "Display name must be less than 50 characters";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    if (formData.favoriteGenres.length > 5) {
      newErrors.favoriteGenres = "Please select up to 5 genres";
    }

    // Validate social links
    Object.entries(formData.socialLinks).forEach(([platform, url]) => {
      if (url && !isValidUrl(url)) {
        newErrors[
          `socialLinks.${platform}`
        ] = `Please enter a valid ${platform} URL`;
      }
    });

    // Validate date of birth
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13 || age > 120) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Form submission - FIXED TYPE ISSUES
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        setNotification({
          type: "error",
          message: "Please fix the errors below",
        });
        return;
      }

      setIsLoading(true);
      setNotification(null);

      try {
        // Upload avatar if changed
        let avatarUrl = user?.profile?.avatar || "";
        if (avatarFile) {
          try {
            const uploadResult = await uploadAvatar(avatarFile);
            avatarUrl = uploadResult.url;
          } catch (avatarError) {
            console.error("Avatar upload failed:", avatarError);
            setNotification({
              type: "error",
              message: "Failed to upload avatar. Please try again.",
            });
            setIsLoading(false);
            return;
          }
        }

        // Prepare profile data with correct typing
        const profileUpdateData = {
          displayName: formData.displayName.trim(),
          bio: formData.bio.trim(),
          country: formData.country.trim() || undefined,
          website: formData.website.trim() || undefined,
          avatar: avatarUrl || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          favoriteGenres: formData.favoriteGenres,
          socialLinks: {
            twitter: formData.socialLinks.twitter.trim() || undefined,
            instagram: formData.socialLinks.instagram.trim() || undefined,
            facebook: formData.socialLinks.facebook.trim() || undefined,
          },
        };

        // Remove undefined fields to avoid sending empty strings
        const cleanedData = Object.fromEntries(
          Object.entries(profileUpdateData).filter(([_, value]) => {
            if (value === undefined || value === "") return false;
            if (typeof value === "object" && value !== null) {
              // For socialLinks object, check if it has any non-empty values
              const hasValues = Object.values(value).some(
                (v) => v !== undefined && v !== ""
              );
              return hasValues;
            }
            return true;
          })
        );

        // Update profile
        await updateProfile(cleanedData);

        setNotification({
          type: "success",
          message: "Profile updated successfully!",
        });

        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error: any) {
        console.error("Failed to update profile:", error);
        setNotification({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to update profile. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      avatarFile,
      user,
      validateForm,
      updateProfile,
      uploadAvatar,
      onClose,
    ]
  );

  // Auto-hide notifications
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const isFormLoading = isLoading || storeLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isFormLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden">
          {/* Notification */}
          {notification && (
            <div
              className={`absolute top-4 left-4 right-4 z-10 p-3 rounded-lg border flex items-center gap-2 ${
                notification.type === "success"
                  ? "bg-green-500/20 border-green-500/30 text-green-400"
                  : "bg-red-500/20 border-red-500/30 text-red-400"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <Button
              onClick={onClose}
              disabled={isFormLoading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-700"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-gray-700 flex items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFormLoading}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Profile Picture
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFormLoading}
                    className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isFormLoading}
                  placeholder="Upload profile picture"
                  title="Upload profile picture"
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.displayName
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Your display name"
                      disabled={isFormLoading}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <MapPin className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your country"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    errors.bio ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Tell us about yourself..."
                  disabled={isFormLoading}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && (
                    <p className="text-sm text-red-400">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-400 ml-auto">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>

              {/* Website and Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <LinkIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.website ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="https://yourwebsite.com"
                      disabled={isFormLoading}
                    />
                  </div>
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.website}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isFormLoading}
                      placeholder="Select your date of birth"
                      title="Date of Birth"
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Social Links
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.socialLinks).map(
                    ([platform, value]) => (
                      <div key={platform}>
                        <input
                          type="url"
                          value={value}
                          onChange={(e) =>
                            handleSocialLinkChange(
                              platform as keyof ProfileFormData["socialLinks"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={`${
                            platform.charAt(0).toUpperCase() + platform.slice(1)
                          } URL`}
                          title={`Enter your ${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                          disabled={isFormLoading}
                        />
                        {errors[`socialLinks.${platform}`] && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors[`socialLinks.${platform}`]}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Favorite Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Favorite Genres (Select up to 5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      disabled={
                        isFormLoading ||
                        (!formData.favoriteGenres.includes(genre) &&
                          formData.favoriteGenres.length >= 5)
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        formData.favoriteGenres.includes(genre)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {errors.favoriteGenres && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.favoriteGenres}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  {formData.favoriteGenres.length}/5 selected
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isFormLoading}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormLoading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
                >
                  {isFormLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
