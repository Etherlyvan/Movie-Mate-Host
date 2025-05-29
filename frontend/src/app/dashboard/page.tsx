// frontend/src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  Film,
  Bookmark,
  Calendar,
  Award,
  Activity as ActivityIcon,
  ArrowRight,
  Play,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import { Activity } from "@/types";

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user: authUser } = useAuthStore();
  const { user, fetchUser, isLoading: userLoading } = useUserStore();
  const {
    stats,
    activities,
    fetchProfileStats,
    fetchUserActivity,
    isLoading: profileLoading,
  } = useProfileStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchProfileStats(),
          fetchUserActivity(8),
        ]);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeDashboard();
  }, [isAuthenticated, fetchUser, fetchProfileStats, fetchUserActivity]);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (!isInitialized || userLoading || profileLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Stats Overview */}
        <div className="mt-8">
          <StatsOverview stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={activities} />
          </div>

          {/* Quick Actions & Recommendations */}
          <div className="space-y-6">
            <QuickActions />
            <RecommendationsWidget />
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WatchingProgress user={user} />
          <GenreBreakdown stats={stats} />
        </div>
      </div>
    </div>
  );
};

// Dashboard Header Component
const DashboardHeader: React.FC<{ user: any }> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={user?.profile?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-500/20"
          />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {user?.profile?.displayName || user?.username}!
          </h1>
          <p className="text-gray-400 mt-1">
            Ready to discover your next favorite movie?
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 flex space-x-3">
        <Link
          href="/movies/search"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Movie
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

// Stats Overview Component
const StatsOverview: React.FC<{ stats: any }> = ({ stats }) => {
  const statCards = [
    {
      title: "Movies Watched",
      value: stats?.totalMoviesWatched || 0,
      icon: <Film className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12 this month",
    },
    {
      title: "Bookmarked",
      value: stats?.totalBookmarked || 0,
      icon: <Bookmark className="h-6 w-6" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      change: "+5 this week",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0",
      icon: <Star className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "Last 30 days",
    },
    {
      title: "Watch Time",
      value: "24h",
      icon: <Clock className="h-6 w-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "This month",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Recent Activity Component
const RecentActivity: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "watched":
        return <Play className="h-4 w-4 text-green-500" />;
      case "bookmarked":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case "rated":
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ActivityIcon className="h-5 w-5 mr-2 text-blue-500" />
          Recent Activity
        </h2>
        <Link
          href="/profile?tab=activity"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={`${activity.movieId}-${index}`}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>

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
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ActivityIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-gray-500 text-sm mt-1">
              Start watching movies to see your activity here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const actions = [
    {
      title: "Discover Movies",
      description: "Find your next watch",
      href: "/movies",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "My Watchlist",
      description: "Movies to watch later",
      href: "/watchlist",
      icon: <Bookmark className="h-6 w-6" />,
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      title: "Search Movies",
      description: "Find specific titles",
      href: "/movies/search",
      icon: <Film className="h-6 w-6" />,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`block p-4 rounded-lg ${action.color} text-white transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-center">
              <div className="mr-3">{action.icon}</div>
              <div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Additional Components (Simplified for brevity)
const RecommendationsWidget: React.FC = () => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <h2 className="text-xl font-bold text-white mb-4">Recommended for You</h2>
    <p className="text-gray-400 text-sm">AI recommendations coming soon...</p>
  </div>
);

const WatchingProgress: React.FC<{ user: any }> = ({ user }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <h2 className="text-xl font-bold text-white mb-4">Currently Watching</h2>
    <p className="text-gray-400 text-sm">No movies currently in progress</p>
  </div>
);

const GenreBreakdown: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <h2 className="text-xl font-bold text-white mb-4">Favorite Genres</h2>
    <div className="space-y-2">
      {stats?.favoriteGenres?.map((genre: string, index: number) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-gray-300">{genre}</span>
          <span className="text-gray-500 text-sm">
            {Math.floor(Math.random() * 20) + 1} movies
          </span>
        </div>
      )) || <p className="text-gray-400 text-sm">No genre data available</p>}
    </div>
  </div>
);

// Loading Skeleton
const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-700 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardPage;
