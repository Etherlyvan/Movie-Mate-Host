"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Camera,
  Settings,
  Share2,
  Users,
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  User, // Import User icon for default avatar
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { ProfileHeaderProps } from "./types";

interface ProfileStat {
  value: number | string;
  label: string;
  color?: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  stats,
  bookmarksCount,
  onEditProfile,
  isOwnProfile = true,
}) => {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Memoized profile statistics
  const profileStats: ProfileStat[] = useMemo(
    () => [
      {
        value: stats?.totalMoviesWatched || 0,
        label: "Watched",
        color: "text-blue-400",
      },
      {
        value: bookmarksCount,
        label: "Bookmarked",
        color: "text-yellow-400",
      },
      {
        value: stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0",
        label: "Avg Rating",
        color: "text-green-400",
      },
    ],
    [stats, bookmarksCount]
  );

  // Memoized social links
  const socialLinks: SocialLink[] = useMemo(() => {
    const links: SocialLink[] = [];

    if (user?.profile?.socialLinks?.twitter) {
      links.push({
        platform: "Twitter",
        url: user.profile.socialLinks.twitter,
        icon: <TwitterIcon className="h-4 w-4" />,
        color: "hover:text-blue-400",
      });
    }

    if (user?.profile?.socialLinks?.instagram) {
      links.push({
        platform: "Instagram",
        url: user.profile.socialLinks.instagram,
        icon: <InstagramIcon className="h-4 w-4" />,
        color: "hover:text-pink-400",
      });
    }

    if (user?.profile?.socialLinks?.facebook) {
      links.push({
        platform: "Facebook",
        url: user.profile.socialLinks.facebook,
        icon: <FacebookIcon className="h-4 w-4" />,
        color: "hover:text-blue-600",
      });
    }

    return links;
  }, [user?.profile?.socialLinks]);

  // Event handlers
  const handleShareProfile = useCallback(async () => {
    const profileUrl = `${window.location.origin}/profile/${user.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.profile?.displayName || user.username}'s Profile`,
          text: `Check out ${
            user.profile?.displayName || user.username
          }'s movie profile on MovieMate`,
          url: profileUrl,
        });
      } catch (error) {
        console.error("Error sharing profile:", error);
      }
    } else {
      // Fallback to clipboard
      await handleCopyProfileLink();
    }
  }, [user]);

  const handleCopyProfileLink = useCallback(async () => {
    const profileUrl = `${window.location.origin}/profile/${user.username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error("Failed to copy profile link:", error);
    }
  }, [user.username]);

  const getProfileVisibilityIcon = useCallback(() => {
    if (user?.profile?.isPublic) {
      return <Globe className="h-4 w-4 text-green-400" />;
    }
    return <Lock className="h-4 w-4 text-gray-400" />;
  }, [user?.profile?.isPublic]);

  const formatJoinDate = useCallback((date: Date | string) => {
    try {
      return format(new Date(date), "MMMM yyyy");
    } catch (error) {
      return "Unknown";
    }
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  // Check if we should show avatar or fallback
  const showAvatarImage = user?.profile?.avatar && !avatarError;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
        {/* Avatar and Quick Stats Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 lg:flex-col lg:space-x-0 lg:space-y-6">
          {/* Avatar */}
          <div className="relative group mx-auto sm:mx-0">
            <div className="relative">
              {showAvatarImage ? (
                <img
                  src={user.profile.avatar || undefined}
                  alt={`${
                    user?.profile?.displayName || user?.username
                  }'s profile`}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300 shadow-xl"
                  onError={handleAvatarError}
                />
              ) : (
                // Fallback avatar using icon
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300 shadow-xl flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}

              {/* Profile visibility indicator */}
              <div className="absolute bottom-2 right-2 p-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-600">
                {getProfileVisibilityIcon()}
              </div>
            </div>

            {/* Edit avatar button (only for own profile) */}
            {isOwnProfile && (
              <button
                onClick={onEditProfile}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit profile picture"
                aria-label="Edit profile picture"
                type="button"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-6 lg:mt-0 w-full sm:w-auto">
            {profileStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    stat.color || "text-white"
                  } transition-colors`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="flex-1 mt-6 lg:mt-0">
          {/* Header with name and actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2 break-words">
                {user?.profile?.displayName || user?.username}
              </h1>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-gray-400 font-medium">@{user?.username}</p>
                {user?.profile?.isPublic ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onEditProfile}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    type="button"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>

                  <Link
                    href="/settings"
                    className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </>
              ) : (
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  type="button"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Follow
                </button>
              )}

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleShareProfile}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  title="Share profile"
                  aria-label="Share profile"
                  type="button"
                >
                  {copiedToClipboard ? (
                    <Check className="h-4 w-4 mr-2 text-green-400" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {copiedToClipboard ? "Copied!" : "Share"}
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user?.profile?.bio && (
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {user.profile.bio}
              </p>
            </div>
          )}

          {/* Profile Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                Joined{" "}
                {formatJoinDate(user?.profile?.joinedDate || user?.createdAt)}
              </span>
            </div>

            {user?.profile?.country && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{user.profile.country}</span>
              </div>
            )}

            {user?.profile?.website && (
              <a
                href={user.profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-400 transition-colors group"
              >
                <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-xs">Website</span>
                <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-400 font-medium">
                Connect:
              </span>
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors ${link.color}`}
                  title={`${user?.profile?.displayName || user?.username} on ${
                    link.platform
                  }`}
                  aria-label={`Visit ${link.platform} profile`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}

          {/* Favorite Genres */}
          {user?.profile?.favoriteGenres?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.profile.favoriteGenres.map(
                  (genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30 hover:bg-blue-600/30 transition-colors"
                    >
                      {genre}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Social Media Icons Components (same as before)
const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.017 0C8.396 0 7.984.013 6.77.06 5.56.107 4.75.272 4.045.515c-.726.282-1.343.66-1.955 1.272C1.478 2.399 1.1 3.016.818 3.742.575 4.447.41 5.257.363 6.467.316 7.681.303 8.093.303 11.714s.013 4.033.06 5.247c.047 1.21.212 2.02.455 2.725.282.726.66 1.343 1.272 1.955.612.612 1.229.99 1.955 1.272.705.243 1.515.408 2.725.455 1.214.047 1.626.06 5.247.06s4.033-.013 5.247-.06c1.21-.047 2.02-.212 2.725-.455.726-.282 1.343-.66 1.955-1.272.612-.612.99-1.229 1.272-1.955.243-.705.408-1.515.455-2.725.047-1.214.06-1.626.06-5.247s-.013-4.033-.06-5.247c-.047-1.21-.212-2.02-.455-2.725C22.9 4.016 22.522 3.399 21.91 2.787 21.298 2.175 20.681 1.797 19.955 1.515 19.25 1.272 18.44 1.107 17.23 1.06 16.016 1.013 15.604 1 11.983 1h.034zm-.717 1.442h.718c3.136 0 3.513.012 4.75.06 1.146.052 1.768.244 2.18.405.548.213.94.468 1.351.879.411.411.666.803.879 1.351.161.412.353 1.034.405 2.18.048 1.237.06 1.614.06 4.75s-.012 3.513-.06 4.75c-.052 1.146-.244 1.768-.405 2.18-.213.548-.468.94-.879 1.351-.411.411-.803.666-1.351.879-.412.161-1.034.353-2.18.405-1.237.048-1.614.06-4.75.06s-3.513-.012-4.75-.06c-1.146-.052-1.768-.244-2.18-.405-.548-.213-.94-.468-1.351-.879-.411-.411-.666-.803-.879-1.351-.161-.412-.353-1.034-.405-2.18-.048-1.237-.06-1.614-.06-4.75s.012-3.513.06-4.75c.052-1.146.244-1.768.405-2.18.213-.548.468-.94.879-1.351.411-.411.803-.666 1.351-.879.412-.161 1.034-.353 2.18-.405 1.237-.048 1.614-.06 4.75-.06z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M12.017 15.33a3.33 3.33 0 110-6.66 3.33 3.33 0 010 6.66zm0-8.442a5.112 5.112 0 100 10.224 5.112 5.112 0 000-10.224zm6.718-1.442a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"
      clipRule="evenodd"
    />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      clipRule="evenodd"
    />
  </svg>
);
