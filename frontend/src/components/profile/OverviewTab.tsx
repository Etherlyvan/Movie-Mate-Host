"use client";

import React, { useMemo } from "react";
import {
  Star,
  Film,
  Bookmark,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Zap,
  Eye,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format, subDays, isAfter } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import type { OverviewTabProps } from "./types";

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  stats,
  activities,
  bookmarks,
}) => {
  // Enhanced statistics calculations
  const enhancedStats = useMemo(() => {
    const movieLogs = user?.movieLogs || [];
    const watchedMovies = movieLogs.filter(
      (log: any) => log.status === "watched"
    );
    const ratedMovies = watchedMovies.filter((movie: any) => movie.rating);
    const reviewedMovies = watchedMovies.filter((movie: any) =>
      movie.review?.trim()
    );

    // Recent activity calculations (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);

    const recentActivities = activities.filter((activity) =>
      isAfter(new Date(activity.date), thirtyDaysAgo)
    );

    const recentWatched = watchedMovies.filter((movie: any) =>
      isAfter(new Date(movie.dateWatched || movie.dateAdded), thirtyDaysAgo)
    );

    const weeklyWatched = watchedMovies.filter((movie: any) =>
      isAfter(new Date(movie.dateWatched || movie.dateAdded), sevenDaysAgo)
    );

    // Calculate watch streak
    const sortedWatched = [...watchedMovies].sort(
      (a: any, b: any) =>
        new Date(b.dateWatched || b.dateAdded).getTime() -
        new Date(a.dateWatched || a.dateAdded).getTime()
    );

    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const movie of sortedWatched) {
      const movieDate = new Date(movie.dateWatched || movie.dateAdded);

      if (!lastDate) {
        currentStreak = 1;
        lastDate = movieDate;
        continue;
      }

      const daysDiff = Math.floor(
        (lastDate.getTime() - movieDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 7) {
        currentStreak++;
        lastDate = movieDate;
      } else {
        break;
      }
    }

    // Calculate average rating
    const avgRating =
      ratedMovies.length > 0
        ? ratedMovies.reduce(
            (sum: number, movie: any) => sum + (movie.rating || 0),
            0
          ) / ratedMovies.length
        : 0;

    // Find highest rated movie
    const highestRated = ratedMovies.reduce((highest: any, movie: any) => {
      if (!highest || (movie.rating || 0) > (highest.rating || 0)) {
        return movie;
      }
      return highest;
    }, null);

    return {
      totalWatched: watchedMovies.length,
      totalRated: ratedMovies.length,
      totalReviewed: reviewedMovies.length,
      totalBookmarked: bookmarks.length,
      avgRating,
      recentActivity: recentActivities.length,
      recentWatched: recentWatched.length,
      weeklyWatched: weeklyWatched.length,
      currentStreak,
      estimatedWatchTime: watchedMovies.length * 120,
      highestRated,
      completionRate:
        movieLogs.length > 0
          ? (watchedMovies.length / movieLogs.length) * 100
          : 0,
    };
  }, [user, stats, activities, bookmarks]);

  // Quick stats configuration
  const quickStats = useMemo(
    () => [
      {
        icon: <Film className="h-5 w-5" />,
        label: "Movies Watched",
        value: enhancedStats.totalWatched,
        color: "bg-blue-500/20 text-blue-400",
        trend:
          enhancedStats.weeklyWatched > 0
            ? {
                value: enhancedStats.weeklyWatched,
                label: "this week",
                isPositive: true,
              }
            : undefined,
      },
      {
        icon: <Star className="h-5 w-5" />,
        label: "Average Rating",
        value: enhancedStats.avgRating
          ? enhancedStats.avgRating.toFixed(1)
          : "0.0",
        color: "bg-yellow-500/20 text-yellow-400",
        subtitle: "out of 10",
      },
      {
        icon: <Bookmark className="h-5 w-5" />,
        label: "Bookmarked",
        value: enhancedStats.totalBookmarked,
        color: "bg-purple-500/20 text-purple-400",
      },
      {
        icon: <Zap className="h-5 w-5" />,
        label: "Current Streak",
        value: enhancedStats.currentStreak,
        color: "bg-green-500/20 text-green-400",
        subtitle: enhancedStats.currentStreak === 1 ? "movie" : "movies",
      },
      {
        icon: <MessageSquare className="h-5 w-5" />,
        label: "Reviews Written",
        value: enhancedStats.totalReviewed,
        color: "bg-pink-500/20 text-pink-400",
      },
      {
        icon: <Clock className="h-5 w-5" />,
        label: "Watch Time",
        value: `${Math.floor(enhancedStats.estimatedWatchTime / 60)}h`,
        color: "bg-indigo-500/20 text-indigo-400",
        subtitle: `${enhancedStats.estimatedWatchTime % 60}m estimated`,
      },
    ],
    [enhancedStats]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <RecentActivitySection activities={activities} />

        {/* Achievement Highlights */}
        <AchievementHighlights user={user} stats={enhancedStats} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recently Watched */}
        <RecentlyWatchedSection movieLogs={user?.movieLogs || []} />

        {/* Recent Bookmarks */}
        <RecentBookmarksSection bookmarks={bookmarks} />

        {/* Top Rated Movies */}
        <TopRatedSection movieLogs={user?.movieLogs || []} />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}> = ({ icon, label, value, color, subtitle, trend }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-bold text-white truncate">{value}</div>
        <div className="text-xs text-gray-400 truncate">{label}</div>
      </div>
    </div>

    {subtitle && <div className="text-xs text-gray-500 mb-1">{subtitle}</div>}

    {trend && (
      <div
        className={`flex items-center gap-1 text-xs ${
          trend.isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        <TrendingUp
          className={`h-3 w-3 ${!trend.isPositive ? "rotate-180" : ""}`}
        />
        +{trend.value} {trend.label}
      </div>
    )}
  </div>
);

// Recent Activity Section
const RecentActivitySection: React.FC<{ activities: any[] }> = ({
  activities,
}) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-400" />
        Recent Activity
      </h3>
      {activities.length > 6 && (
        <Link
          href="#activity"
          onClick={() => (window.location.hash = "activity")}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>

    <div className="space-y-4">
      {activities.slice(0, 6).map((activity, index) => (
        <ActivityItem
          key={`${activity.movieId}-${activity.type}-${index}`}
          activity={activity}
        />
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No recent activity</p>
          <p className="text-gray-500 text-sm">
            Start watching movies to see your activity here
          </p>
        </div>
      )}
    </div>
  </div>
);

// Activity Item Component
const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "watched":
        return <Film className="h-4 w-4 text-green-500" />;
      case "bookmarked":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case "rated":
        return <Star className="h-4 w-4 text-blue-500" />;
      case "reviewed":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: any): string => {
    switch (activity.type) {
      case "watched":
        return "watched";
      case "bookmarked":
        return "bookmarked";
      case "rated":
        return `rated ${activity.rating}/10`;
      case "reviewed":
        return "reviewed";
      default:
        return "interacted with";
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors group">
      <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>

      <div className="flex-shrink-0">
        <img
          src={getImageUrl(activity.moviePoster, "w92")}
          alt={activity.movieTitle}
          className="h-10 w-7 object-cover rounded group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          You {getActivityText(activity)}{" "}
          <Link
            href={`/movies/${activity.movieId}`}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {activity.movieTitle}
          </Link>
        </p>
        <p className="text-gray-400 text-xs">
          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

// Sidebar Sections
const RecentlyWatchedSection: React.FC<{ movieLogs: any[] }> = ({
  movieLogs,
}) => {
  const recentWatched = movieLogs
    .filter((log) => log.status === "watched")
    .slice(0, 5);

  return (
    <SidebarSection
      title="Recently Watched"
      icon={<Eye className="h-5 w-5 text-green-400" />}
      items={recentWatched.map((log) => ({
        id: log.movieId,
        title: log.movieTitle,
        poster: log.moviePoster,
        subtitle: log.rating ? `${log.rating}/10` : undefined,
        meta: formatDistanceToNow(new Date(log.dateWatched || log.dateAdded), {
          addSuffix: true,
        }),
        href: `/movies/${log.movieId}`,
      }))}
      emptyMessage="No movies watched yet"
      viewAllHash="watched"
    />
  );
};

const RecentBookmarksSection: React.FC<{ bookmarks: any[] }> = ({
  bookmarks,
}) => (
  <SidebarSection
    title="Recent Bookmarks"
    icon={<Bookmark className="h-5 w-5 text-yellow-400" />}
    items={bookmarks.slice(0, 5).map((bookmark) => ({
      id: bookmark.movieId,
      title: bookmark.movieTitle,
      poster: bookmark.moviePoster,
      meta: formatDistanceToNow(new Date(bookmark.dateAdded), {
        addSuffix: true,
      }),
      href: `/movies/${bookmark.movieId}`,
    }))}
    emptyMessage="No bookmarks yet"
    viewAllHash="bookmarks"
  />
);

const TopRatedSection: React.FC<{ movieLogs: any[] }> = ({ movieLogs }) => {
  const topRated = movieLogs
    .filter((log) => log.rating && log.rating >= 8)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <SidebarSection
      title="Your Top Rated"
      icon={<Award className="h-5 w-5 text-purple-400" />}
      items={topRated.map((log) => ({
        id: log.movieId,
        title: log.movieTitle,
        poster: log.moviePoster,
        subtitle: `${log.rating}/10`,
        meta: formatDistanceToNow(new Date(log.dateWatched || log.dateAdded), {
          addSuffix: true,
        }),
        href: `/movies/${log.movieId}`,
      }))}
      emptyMessage="Rate some movies to see your favorites"
      viewAllHash="watched"
    />
  );
};

// Sidebar Section Component
interface SidebarItem {
  id: number;
  title: string;
  poster: string;
  subtitle?: string;
  meta: string;
  href: string;
}

const SidebarSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: SidebarItem[];
  emptyMessage: string;
  viewAllHash: string;
}> = ({ title, icon, items, emptyMessage, viewAllHash }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {items.length > 0 && (
        <Link
          href={`#${viewAllHash}`}
          onClick={() => (window.location.hash = viewAllHash)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>

    <div className="space-y-3">
      {items.length > 0 ? (
        items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center space-x-3 group"
          >
            <img
              src={getImageUrl(item.poster, "w92")}
              alt={item.title}
              className="h-12 w-8 object-cover rounded group-hover:ring-2 group-hover:ring-blue-500/50 transition-all"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                {item.title}
              </p>
              {item.subtitle && (
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-400">{item.subtitle}</span>
                </div>
              )}
              <p className="text-gray-500 text-xs">{item.meta}</p>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-gray-400 text-sm text-center py-4">{emptyMessage}</p>
      )}
    </div>
  </div>
);

// Achievement Highlights Component
const AchievementHighlights: React.FC<{
  user: any;
  stats: any;
}> = ({ user, stats }) => {
  const achievements = useMemo(() => {
    const achievements = [];

    // Milestone achievements
    if (stats.totalWatched >= 100) {
      achievements.push({
        icon: <Target className="h-5 w-5 text-blue-400" />,
        title: "Century Club",
        description: `Watched ${stats.totalWatched} movies`,
        color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
        rarity: "legendary",
      });
    } else if (stats.totalWatched >= 50) {
      achievements.push({
        icon: <Target className="h-5 w-5 text-green-400" />,
        title: "Half Century",
        description: `Watched ${stats.totalWatched} movies`,
        color: "from-green-500/10 to-emerald-500/10 border-green-500/20",
        rarity: "rare",
      });
    } else if (stats.totalWatched >= 10) {
      achievements.push({
        icon: <Target className="h-5 w-5 text-yellow-400" />,
        title: "Movie Enthusiast",
        description: `Watched ${stats.totalWatched} movies`,
        color: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
        rarity: "common",
      });
    }

    // Streak achievement
    if (stats.currentStreak >= 14) {
      achievements.push({
        icon: <Zap className="h-5 w-5 text-purple-400" />,
        title: "Movie Marathon Master",
        description: `${stats.currentStreak} movie streak`,
        color: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
        rarity: "legendary",
      });
    } else if (stats.currentStreak >= 7) {
      achievements.push({
        icon: <Zap className="h-5 w-5 text-purple-400" />,
        title: "On Fire!",
        description: `${stats.currentStreak} movie streak`,
        color: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
        rarity: "rare",
      });
    }

    // Rating achievement
    if (stats.avgRating >= 8.5) {
      achievements.push({
        icon: <Star className="h-5 w-5 text-yellow-400" />,
        title: "Elite Critic",
        description: `${stats.avgRating.toFixed(1)} average rating`,
        color: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
        rarity: "legendary",
      });
    } else if (stats.avgRating >= 7.5) {
      achievements.push({
        icon: <Star className="h-5 w-5 text-yellow-400" />,
        title: "Discerning Viewer",
        description: `${stats.avgRating.toFixed(1)} average rating`,
        color: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
        rarity: "rare",
      });
    }

    // Review achievement
    if (stats.totalReviewed >= 25) {
      achievements.push({
        icon: <MessageSquare className="h-5 w-5 text-pink-400" />,
        title: "Review Master",
        description: `${stats.totalReviewed} reviews written`,
        color: "from-pink-500/10 to-rose-500/10 border-pink-500/20",
        rarity: "rare",
      });
    }

    return achievements;
  }, [stats]);

  if (achievements.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          Achievements
        </h3>
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No achievements yet</p>
          <p className="text-gray-500 text-sm">
            Keep watching movies to unlock achievements!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Award className="h-5 w-5 text-purple-400" />
        Recent Achievements
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.slice(0, 4).map((achievement, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${achievement.color} rounded-lg p-4 border relative overflow-hidden group hover:scale-105 transition-transform`}
          >
            <div className="flex items-center gap-3 relative z-10">
              {achievement.icon}
              <div>
                <h4 className="font-semibold text-white">
                  {achievement.title}
                </h4>
                <p className="text-gray-400 text-sm">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Rarity indicator */}
            <div
              className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                achievement.rarity === "legendary"
                  ? "bg-purple-600 text-white"
                  : achievement.rarity === "rare"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-200"
              }`}
            >
              {achievement.rarity}
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>
        ))}
      </div>
    </div>
  );
};
