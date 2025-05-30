"use client";

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  User as UserIcon,
  Film,
  Bookmark,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { UserStatistics } from '@/types';

type TabType = "overview" | "watched" | "bookmarks" | "activity" | "stats";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  color?: string;
  description?: string;
}

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats: UserStatistics;
  bookmarksCount: number;
  className?: string;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  stats,
  bookmarksCount,
  className = ""
}) => {
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Memoized tab configuration
  const tabs: TabConfig[] = useMemo(() => [
    {
      id: "overview",
      label: "Overview",
      icon: UserIcon,
      color: "blue",
      description: "Profile summary and recent activity"
    },
    {
      id: "watched",
      label: "Watched",
      icon: Film,
      count: stats?.totalMoviesWatched || 0,
      color: "green",
      description: "Movies you've watched"
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      count: bookmarksCount,
      color: "yellow",
      description: "Your saved movies"
    },
    {
      id: "activity",
      label: "Activity",
      icon: Clock,
      color: "purple",
      description: "Your recent activity feed"
    },
    {
      id: "stats",
      label: "Statistics",
      icon: BarChart3,
      color: "pink",
      description: "Detailed viewing statistics"
    }
  ], [stats, bookmarksCount]);

  // Color mapping for different states
  const colorClasses = {
    blue: {
      active: "border-blue-500 text-blue-400 bg-blue-500/10",
      inactive: "border-transparent text-gray-400 hover:text-blue-300 hover:border-blue-300/50",
      count: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    green: {
      active: "border-green-500 text-green-400 bg-green-500/10",
      inactive: "border-transparent text-gray-400 hover:text-green-300 hover:border-green-300/50",
      count: "bg-green-500/20 text-green-400 border-green-500/30"
    },
    yellow: {
      active: "border-yellow-500 text-yellow-400 bg-yellow-500/10",
      inactive: "border-transparent text-gray-400 hover:text-yellow-300 hover:border-yellow-300/50",
      count: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
    purple: {
      active: "border-purple-500 text-purple-400 bg-purple-500/10",
      inactive: "border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-300/50",
      count: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    },
    pink: {
      active: "border-pink-500 text-pink-400 bg-pink-500/10",
      inactive: "border-transparent text-gray-400 hover:text-pink-300 hover:border-pink-300/50",
      count: "bg-pink-500/20 text-pink-400 border-pink-500/30"
    }
  };

  // Check if scrolling is needed
  const checkScrollability = useCallback(() => {
    if (!tabsContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  }, [tabsContainerRef]);

  // Scroll handlers
  const scrollLeft = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, [tabsContainerRef]);

  const scrollRight = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, [tabsContainerRef]);

  // Handle tab change with URL hash update
  const handleTabChange = useCallback((tab: TabType) => {
    onTabChange(tab);
    
    // Update URL hash without triggering page reload
    const newUrl = `${window.location.pathname}${window.location.search}#${tab}`;
    window.history.replaceState(null, '', newUrl);
  }, [onTabChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, tab: TabType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabChange(tab);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      let newIndex;
      
      if (event.key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      
      handleTabChange(tabs[newIndex].id);
    }
  }, [tabs, activeTab, handleTabChange]);

  // Effects
  useEffect(() => {
    checkScrollability();
    
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability]);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const handleScroll = () => checkScrollability();
      const container = tabsContainerRef.current;
      container.addEventListener('scroll', handleScroll);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
    // If no container, return undefined (not null)
    return undefined;
  }, [tabsContainerRef, checkScrollability]);

  return (
    <div className={`mt-8 ${className}`}>
      <div className="relative">
        {/* Scroll buttons */}
        {showScrollButtons && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-full transition-all duration-200 ${
                canScrollLeft 
                  ? 'text-white hover:bg-gray-700 hover:border-gray-500' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-full transition-all duration-200 ${
                canScrollRight 
                  ? 'text-white hover:bg-gray-700 hover:border-gray-500' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Tabs container */}
        <div className="border-b border-gray-700/50">
          <nav
            ref={tabsContainerRef}
            className="flex space-x-1 overflow-x-auto scrollbar-hide px-8 md:px-0"
            role="tablist"
            aria-label="Profile navigation"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const colors = colorClasses[tab.color as keyof typeof colorClasses] || colorClasses.blue;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, tab.id)}
                  className={`group relative flex items-center py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-t-lg ${
                    isActive ? colors.active : colors.inactive
                  }`}
                  role="tab"
                  id={`${tab.id}-tab`}
                  title={tab.description}
                >
                  {/* Tab content */}
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    
                    <span className="font-semibold">{tab.label}</span>
                    
                    {/* Count badge */}
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${
                          isActive ? colors.count : 'bg-gray-700 text-gray-400 border-gray-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-current rounded-full transform translate-y-1" />
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile tab indicator */}
        <div className="md:hidden mt-2 flex justify-center">
          <div className="flex space-x-1">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab panels accessibility */}
      <div className="sr-only">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            hidden={activeTab !== tab.id}
          >
            {tab.description}
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom scrollbar hiding styles (add to your global CSS)
const scrollbarHideStyles = `
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
`;

// Export styles for use in global CSS
export { scrollbarHideStyles };
export type { ProfileTabsProps, TabType, TabConfig };