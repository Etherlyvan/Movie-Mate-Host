"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useProfileStore } from "@/stores/profileStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import {
  ActivityTab,
  StatsTab,
  EditProfileModal,
  ProfileHeader,
  ProfileTabs,
  BookmarksTab,
  WatchedTab,
  OverviewTab,
} from "@/components/profile";
import type { TabType, ViewType } from "@/components/profile/types";

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { user, fetchUser, isLoading: userLoading } = useUserStore();
  const {
    stats,
    activities,
    fetchProfileStats,
    fetchUserActivity,
    isLoading: profileLoading,
  } = useProfileStore();

  const {
    bookmarks,
    fetchBookmarks,
    isLoading: bookmarksLoading,
  } = useBookmarkStore();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    const initializeProfile = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchProfileStats(),
          fetchUserActivity(20),
          fetchBookmarks(),
        ]);
      } catch (error) {
        console.error("Profile initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeProfile();
  }, [
    isAuthenticated,
    fetchUser,
    fetchProfileStats,
    fetchUserActivity,
    fetchBookmarks,
  ]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabType;
    if (
      ["overview", "watched", "bookmarks", "activity", "stats"].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // Create enhanced stats with missing properties
  const enhancedStats = stats
    ? {
        ...stats,
        totalWatchTime: stats.totalWatchTime || 0,
        watchingStreak: stats.watchingStreak || 0,
      }
    : null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (!isInitialized || userLoading || profileLoading || bookmarksLoading) {
    return <ProfileSkeleton />;
  }

  // Add null checks for required props
  if (!user || !enhancedStats) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileHeader
            user={user}
            stats={enhancedStats}
            bookmarksCount={bookmarks?.length || 0}
            onEditProfile={() => setIsEditingProfile(true)}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            stats={enhancedStats}
            bookmarksCount={bookmarks?.length || 0}
          />

          <div className="mt-8">
            {activeTab === "overview" && (
              <OverviewTab
                user={user}
                stats={enhancedStats}
                activities={activities || []}
                bookmarks={bookmarks || []}
              />
            )}

            {activeTab === "watched" && (
              <WatchedTab
                movies={
                  user?.movieLogs?.filter((log) => log.status === "watched") ||
                  []
                }
                viewType={viewType}
                onViewTypeChange={setViewType}
              />
            )}

            {activeTab === "bookmarks" && (
              <BookmarksTab
                bookmarks={bookmarks || []}
                viewType={viewType}
                onViewTypeChange={setViewType}
              />
            )}

            {activeTab === "activity" && (
              <ActivityTab activities={activities || []} />
            )}

            {activeTab === "stats" && (
              <StatsTab user={user} stats={enhancedStats} />
            )}
          </div>

          {isEditingProfile && (
            <EditProfileModal
              user={user}
              onClose={() => setIsEditingProfile(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-700 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-8">
              <div className="h-32 w-32 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-600 rounded mb-4 w-1/3"></div>
                <div className="h-4 bg-gray-600 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          </div>

          <div className="h-12 bg-gray-700 rounded mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePage;
