"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Film,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import type { MovieLog } from "@/types";

interface StatsTabProps {
  user: any;
  stats: any;
}

interface GenreStats {
  name: string;
  count: number;
  percentage: number;
  avgRating: number;
}

interface MonthlyStats {
  month: string;
  watched: number;
  rated: number;
  avgRating: number;
}

export const StatsTab: React.FC<StatsTabProps> = ({ user, stats }) => {
  const comprehensiveStats = useMemo(() => {
    const movieLogs = user?.movieLogs || [];
    const watchedMovies = movieLogs.filter(
      (log: MovieLog) => log.status === "watched"
    );

    // Genre statistics (placeholder implementation)
    const genreMap = new Map<
      string,
      { count: number; totalRating: number; ratingCount: number }
    >();

    watchedMovies.forEach((movie: MovieLog) => {
      const genres = ["Action", "Drama", "Comedy"]; // This should come from actual movie data

      genres.forEach((genre) => {
        const current = genreMap.get(genre) || {
          count: 0,
          totalRating: 0,
          ratingCount: 0,
        };
        current.count++;

        if (movie.rating) {
          current.totalRating += movie.rating;
          current.ratingCount++;
        }

        genreMap.set(genre, current);
      });
    });

    const genreStats: GenreStats[] = Array.from(genreMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage:
          watchedMovies.length > 0
            ? (data.count / watchedMovies.length) * 100
            : 0,
        avgRating:
          data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Monthly statistics
    const monthlyMap = new Map<
      string,
      { watched: number; rated: number; totalRating: number }
    >();

    watchedMovies.forEach((movie: MovieLog) => {
      const month = format(
        new Date(movie.dateWatched || movie.dateAdded),
        "MMM yyyy"
      );
      const current = monthlyMap.get(month) || {
        watched: 0,
        rated: 0,
        totalRating: 0,
      };

      current.watched++;
      if (movie.rating) {
        current.rated++;
        current.totalRating += movie.rating;
      }

      monthlyMap.set(month, current);
    });

    const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        watched: data.watched,
        rated: data.rated,
        avgRating: data.rated > 0 ? data.totalRating / data.rated : 0,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12);

    // Rating distribution
    const ratingDistribution = Array.from({ length: 10 }, (_, i) => {
      const rating = i + 1;
      const count = watchedMovies.filter(
        (movie: MovieLog) => movie.rating && Math.floor(movie.rating) === rating
      ).length;
      return { rating, count };
    });

    // Calculate streaks
    const sortedByDate = [...watchedMovies].sort(
      (a, b) =>
        new Date(a.dateWatched || a.dateAdded).getTime() -
        new Date(b.dateWatched || b.dateAdded).getTime()
    );

    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: Date | null = null;

    sortedByDate.forEach((movie: MovieLog) => {
      const movieDate = new Date(movie.dateWatched || movie.dateAdded);

      if (lastDate) {
        const daysDiff = Math.floor(
          (movieDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 7) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      lastDate = movieDate;
    });

    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      genreStats,
      monthlyStats,
      ratingDistribution,
      maxStreak,
      currentStreak,
      totalWatchTime: watchedMovies.length * 120,
      highestRatedMovie: watchedMovies.reduce(
        (highest: MovieLog | null, movie: MovieLog) => {
          if (!movie.rating) return highest;
          if (!highest || !highest.rating || movie.rating > highest.rating) {
            return movie;
          }
          return highest;
        },
        null
      ),
    };
  }, [user]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          </div>

          <div className="text-2xl font-bold text-white mb-1">{value}</div>

          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}

          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${
                trend.isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${!trend.isPositive ? "rotate-180" : ""}`}
              />
              {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Movies Watched"
          value={stats?.totalMoviesWatched || 0}
          icon={<Film className="h-5 w-5" />}
          color="bg-blue-500/20 text-blue-400"
        />

        <StatCard
          title="Average Rating"
          value={stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          subtitle="out of 10"
          icon={<Star className="h-5 w-5" />}
          color="bg-yellow-500/20 text-yellow-400"
        />

        <StatCard
          title="Watch Streak"
          value={comprehensiveStats.maxStreak}
          subtitle="movies in a row"
          icon={<Zap className="h-5 w-5" />}
          color="bg-purple-500/20 text-purple-400"
        />

        <StatCard
          title="Total Watch Time"
          value={`${Math.floor(comprehensiveStats.totalWatchTime / 60)}h`}
          subtitle={`${comprehensiveStats.totalWatchTime % 60}m estimated`}
          icon={<Clock className="h-5 w-5" />}
          color="bg-green-500/20 text-green-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Favorite Genres
          </h3>

          <div className="space-y-4">
            {comprehensiveStats.genreStats.map((genre) => (
              <div key={genre.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    {genre.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{genre.count} movies</span>
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {genre.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Rating Distribution
          </h3>

          <div className="space-y-3">
            {comprehensiveStats.ratingDistribution.reverse().map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <span className="text-gray-300 font-medium w-8">
                  {item.rating}★
                </span>

                <div className="flex-1 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (item.count /
                          Math.max(
                            ...comprehensiveStats.ratingDistribution.map(
                              (r) => r.count
                            ),
                            1
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <span className="text-gray-400 text-sm w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-400" />
          Monthly Activity
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {comprehensiveStats.monthlyStats.map((month) => (
            <div key={month.month} className="text-center">
              <div className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                <div className="text-lg font-bold text-white">
                  {month.watched}
                </div>
                <div className="text-xs text-gray-400 mb-1">{month.month}</div>
                {month.avgRating > 0 && (
                  <div className="text-xs text-yellow-400 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    {month.avgRating.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          Achievements & Highlights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comprehensiveStats.highestRatedMovie && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">
                  Highest Rated
                </span>
              </div>
              <p className="text-white font-medium truncate">
                {comprehensiveStats.highestRatedMovie.movieTitle}
              </p>
              <p className="text-gray-400 text-sm">
                {comprehensiveStats.highestRatedMovie.rating}/10 stars
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-purple-400">Best Streak</span>
            </div>
            <p className="text-white font-medium">
              {comprehensiveStats.maxStreak} movies
            </p>
            <p className="text-gray-400 text-sm">
              Your longest watching streak
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Goal Progress</span>
            </div>
            <p className="text-white font-medium">
              {Math.round(((stats?.totalMoviesWatched || 0) / 100) * 100)}%
            </p>
            <p className="text-gray-400 text-sm">Towards 100 movies goal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
