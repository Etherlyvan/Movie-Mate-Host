"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  User as UserIcon,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Camera,
  Star,
  Film,
  Bookmark,
  Clock,
  Award,
  BarChart3,
  Grid,
  List,
  Filter,
  Search,
  Settings,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import { Movie } from "@/types";
import { Activity, MovieLog, WatchlistItem } from "@/types";

type TabType = "overview" | "watched" | "watchlist" | "activity" | "stats";
type ViewType = "grid" | "list";

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
        ]);
      } catch (error) {
        console.error("Profile initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeProfile();
  }, [isAuthenticated, fetchUser, fetchProfileStats, fetchUserActivity]);

  // Handle URL hash for tab navigation
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabType;
    if (
      ["overview", "watched", "watchlist", "activity", "stats"].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (!isInitialized || userLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          stats={stats}
          onEditProfile={() => setIsEditingProfile(true)}
        />

        {/* Navigation Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        />

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <OverviewTab user={user} stats={stats} activities={activities} />
          )}

          {activeTab === "watched" && (
            <WatchedTab
              movies={
                user?.movieLogs?.filter((log) => log.status === "watched") || []
              }
              viewType={viewType}
              onViewTypeChange={setViewType}
            />
          )}

          {activeTab === "watchlist" && (
            <WatchlistTab
              watchlist={user?.watchlist || []}
              viewType={viewType}
              onViewTypeChange={setViewType}
            />
          )}

          {activeTab === "activity" && <ActivityTab activities={activities} />}

          {activeTab === "stats" && <StatsTab user={user} stats={stats} />}
        </div>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditingProfile(false)}
          />
        )}
      </div>
    </div>
  );
};

// Profile Header Component
const ProfileHeader: React.FC<{
  user: any;
  stats: any;
  onEditProfile: () => void;
}> = ({ user, stats, onEditProfile }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 lg:flex-col lg:space-x-0 lg:space-y-4">
          <div className="relative group">
            <img
              src={user?.profile?.avatar || "/default-avatar.png"}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-200"
            />
            <button
              onClick={onEditProfile}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Edit profile picture"
              aria-label="Edit profile picture"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-4 lg:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats?.totalMoviesWatched || 0}
              </div>
              <div className="text-sm text-gray-400">Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats?.totalBookmarked || 0}
              </div>
              <div className="text-sm text-gray-400">Bookmarked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user?.profile?.displayName || user?.username}
              </h1>
              <p className="text-gray-400 mt-1">@{user?.username}</p>
            </div>

            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={onEditProfile}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>

              <Link
                href="/settings"
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <button
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                title="Share profile"
                aria-label="Share profile"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Bio */}
          {user?.profile?.bio && (
            <p className="text-gray-300 mb-4 leading-relaxed">
              {user.profile.bio}
            </p>
          )}

          {/* Profile Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Joined{" "}
              {format(
                new Date(user?.profile?.joinedDate || user?.createdAt),
                "MMMM yyyy"
              )}
            </div>

            {user?.profile?.country && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {user.profile.country}
              </div>
            )}

            {user?.profile?.website && (
              <a
                href={user.profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-400 transition-colors"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Website
              </a>
            )}
          </div>

          {/* Favorite Genres */}
          {user?.profile?.favoriteGenres?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.profile.favoriteGenres.map(
                  (genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
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

// Profile Tabs Component
const ProfileTabs: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats: any;
}> = ({ activeTab, onTabChange, stats }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    {
      id: "watched",
      label: "Watched",
      icon: Film,
      count: stats?.totalMoviesWatched || 0,
    },
    {
      id: "watchlist",
      label: "Watchlist",
      icon: Bookmark,
      count: stats?.totalBookmarked || 0,
    },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "stats", label: "Statistics", icon: BarChart3 },
  ];

  return (
    <div className="mt-8">
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabType)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      isActive
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  user: any;
  stats: any;
  activities: Activity[];
}> = ({ user, stats, activities }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

          <div className="space-y-4">
            {activities.slice(0, 8).map((activity, index) => (
              <ActivityItem
                key={`${activity.movieId}-${index}`}
                activity={activity}
              />
            ))}
          </div>

          {activities.length > 8 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => (window.location.hash = "activity")}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                View All Activity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>

          <div className="space-y-4">
            <StatItem
              icon={<Film className="h-5 w-5 text-blue-500" />}
              label="Movies Watched"
              value={stats?.totalMoviesWatched || 0}
            />
            <StatItem
              icon={<Bookmark className="h-5 w-5 text-yellow-500" />}
              label="Bookmarked"
              value={stats?.totalBookmarked || 0}
            />
            <StatItem
              icon={<Star className="h-5 w-5 text-green-500" />}
              label="Average Rating"
              value={
                stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"
              }
            />
            <StatItem
              icon={<Clock className="h-5 w-5 text-purple-500" />}
              label="Hours Watched"
              value="24h" // This would be calculated from movie runtimes
            />
          </div>
        </div>

        {/* Recently Watched */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">
            Recently Watched
          </h3>

          <div className="space-y-3">
            {user?.movieLogs
              ?.filter((log: MovieLog) => log.status === "watched")
              ?.slice(0, 4)
              ?.map((log: MovieLog, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={getImageUrl(log.moviePoster, "w92")}
                    alt={log.movieTitle}
                    className="h-12 w-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {log.movieTitle}
                    </p>
                    {log.rating && (
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-400">
                          {log.rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )) || (
              <p className="text-gray-400 text-sm">No movies watched yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Watched Tab Component
const WatchedTab: React.FC<{
  movies: MovieLog[];
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}> = ({ movies, viewType, onViewTypeChange }) => {
  const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort movies
  const filteredMovies = movies
    .filter(
      (movie) =>
        movie.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterRating === null ||
          (movie.rating && movie.rating >= filterRating))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.dateWatched || b.dateAdded).getTime() -
            new Date(a.dateWatched || a.dateAdded).getTime()
          );
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "title":
          return a.movieTitle.localeCompare(b.movieTitle);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search watched movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sort watched movies"
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="title">Sort by Title</option>
          </select>

          <select
            value={filterRating || ""}
            onChange={(e) =>
              setFilterRating(e.target.value ? Number(e.target.value) : null)
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter watched movies by rating"
          >
            <option value="">All Ratings</option>
            <option value="8">8+ Stars</option>
          </select>
          <button
            onClick={() => onViewTypeChange("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewType === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:text-white"
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewTypeChange("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewType === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:text-white"
            }`}
            title="List view"
            aria-label="List view"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Movies Grid/List */}
      {filteredMovies.length > 0 ? (
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }
        >
          {filteredMovies.map((movie, index) => (
            <WatchedMovieCard
              key={`${movie.movieId}-${index}`}
              movie={movie}
              viewType={viewType}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No watched movies found
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || filterRating
              ? "Try adjusting your search or filters"
              : "Start watching movies to see them here"}
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Discover Movies
          </Link>
        </div>
      )}
    </div>
  );
};

// Helper Components
const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "watched":
        return <Film className="h-4 w-4 text-green-500" />;
      case "bookmarked":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case "rated":
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "watched":
        return "watched";
      case "bookmarked":
        return "bookmarked";
      case "rated":
        return `rated ${activity.rating}/10`;
      default:
        return "interacted with";
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
      <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>

      <div className="flex-shrink-0">
        <img
          src={getImageUrl(activity.moviePoster, "w92")}
          alt={activity.movieTitle}
          className="h-12 w-8 object-cover rounded"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          You {getActivityText(activity)}{" "}
          <Link
            href={`/movies/${activity.movieId}`}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {activity.movieTitle}
          </Link>
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      {icon}
      <span className="text-gray-300 ml-3">{label}</span>
    </div>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const WatchedMovieCard: React.FC<{
  movie: MovieLog;
  viewType: ViewType;
}> = ({ movie, viewType }) => {
  if (viewType === "list") {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
        <div className="flex items-center space-x-4">
          <img
            src={getImageUrl(movie.moviePoster, "w154")}
            alt={movie.movieTitle}
            className="h-20 w-14 object-cover rounded"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg truncate">
              {movie.movieTitle}
            </h3>

            <div className="flex items-center space-x-4 mt-2">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-gray-300">{movie.rating}/10</span>
                </div>
              )}

              <span className="text-gray-400 text-sm">
                {formatDistanceToNow(
                  new Date(movie.dateWatched || movie.dateAdded),
                  { addSuffix: true }
                )}
              </span>
            </div>

            {movie.review && (
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {movie.review}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/movies/${movie.movieId}`} className="group">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group-hover:scale-105">
        <div className="aspect-[2/3] relative">
          <img
            src={getImageUrl(movie.moviePoster, "w342")}
            alt={movie.movieTitle}
            className="w-full h-full object-cover"
          />

          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              <span className="text-white text-xs font-medium">
                {movie.rating}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate">
            {movie.movieTitle}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {formatDistanceToNow(
              new Date(movie.dateWatched || movie.dateAdded),
              { addSuffix: true }
            )}
          </p>
        </div>
      </div>
    </Link>
  );
};

// Additional tab components would follow similar patterns...
const WatchlistTab: React.FC<{
  watchlist: WatchlistItem[];
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}> = ({ watchlist, viewType, onViewTypeChange }) => {
  // Similar implementation to WatchedTab but for watchlist items
  return <div>Watchlist implementation...</div>;
};

const ActivityTab: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  // Full activity feed implementation
  return <div>Activity implementation...</div>;
};

const StatsTab: React.FC<{ user: any; stats: any }> = ({ user, stats }) => {
  // Comprehensive statistics and charts
  return <div>Statistics implementation...</div>;
};

const EditProfileModal: React.FC<{
  user: any;
  onClose: () => void;
}> = ({ user, onClose }) => {
  // Profile editing modal implementation
  return <div>Edit profile modal...</div>;
};

// Loading Skeleton
const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
);

export default ProfilePage;
