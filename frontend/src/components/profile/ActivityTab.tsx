"use client";

import React, { useState, useMemo } from "react";
import {
  Film,
  Bookmark,
  Star,
  Clock,
  Calendar,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import type { Activity } from "@/types";

interface ActivityTabProps {
  activities: Activity[];
}

type ActivityFilter = "all" | "watched" | "bookmarked" | "rated" | "reviewed";
type ActivitySort = "date" | "type" | "title";

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities }) => {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [sortBy, setSortBy] = useState<ActivitySort>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (searchQuery.trim()) {
      filtered = filtered.filter((activity) =>
        activity.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter((activity) => activity.type === filter);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "type":
          return a.type.localeCompare(b.type);
        case "title":
          return a.movieTitle.localeCompare(b.movieTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activities, filter, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getActivityIcon = (type: Activity["type"]) => {
    const iconProps = { className: "h-5 w-5" };

    switch (type) {
      case "watched":
        return <Film {...iconProps} className="h-5 w-5 text-green-500" />;
      case "bookmarked":
        return <Bookmark {...iconProps} className="h-5 w-5 text-yellow-500" />;
      case "rated":
        return <Star {...iconProps} className="h-5 w-5 text-blue-500" />;
      case "reviewed":
        return (
          <ExternalLink {...iconProps} className="h-5 w-5 text-purple-500" />
        );
      default:
        return <Clock {...iconProps} className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity): string => {
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

  const getActivityColor = (type: Activity["type"]): string => {
    switch (type) {
      case "watched":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "bookmarked":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rated":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "reviewed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Activity Feed
            </h2>
            <p className="text-gray-400">
              {filteredActivities.length}{" "}
              {filteredActivities.length === 1 ? "activity" : "activities"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["watched", "bookmarked", "rated", "reviewed"] as const).map(
              (type) => {
                const count = activities.filter((a) => a.type === type).length;
                return (
                  <div
                    key={type}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getActivityColor(
                      type
                    )}`}
                  >
                    {count} {type}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Filter activities"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as ActivityFilter);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="watched">Watched</option>
              <option value="bookmarked">Bookmarked</option>
              <option value="rated">Rated</option>
              <option value="reviewed">Reviewed</option>
            </select>

            <select
              aria-label="Sort activities"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ActivitySort)}
              className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {paginatedActivities.length > 0 ? (
          paginatedActivities.map((activity, index) => (
            <ActivityItemDetailed
              key={`${activity.movieId}-${activity.type}-${index}`}
              activity={activity}
              icon={getActivityIcon(activity.type)}
              text={getActivityText(activity)}
            />
          ))
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
            <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No activities found
            </h3>
            <p className="text-gray-400">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filters"
                : "Start watching and rating movies to see your activity here"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ActivityItemDetailed: React.FC<{
  activity: Activity;
  icon: React.ReactNode;
  text: string;
}> = ({ activity, icon, text }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">{icon}</div>

        <div className="flex-shrink-0">
          <img
            src={getImageUrl(activity.moviePoster, "w92")}
            alt={activity.movieTitle}
            className="h-16 w-12 object-cover rounded-lg ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">
                You {text}{" "}
                <Link
                  href={`/movies/${activity.movieId}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {activity.movieTitle}
                </Link>
              </p>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(activity.date), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {activity.review && (
                <div className="mt-3 p-3 bg-gray-700/30 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-300 text-sm italic line-clamp-2">
                    "{activity.review}"
                  </p>
                </div>
              )}
            </div>

            {activity.rating && (
              <div className="flex items-center bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm font-medium">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {activity.rating}/10
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
