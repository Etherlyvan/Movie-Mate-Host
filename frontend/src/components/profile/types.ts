import type {
  User,
  UserStatistics,
  Bookmark,
  Activity,
  MovieLog,
} from "@/types";

export type TabType =
  | "overview"
  | "watched"
  | "bookmarks"
  | "activity"
  | "stats";
export type ViewType = "grid" | "list";

export interface ProfileHeaderProps {
  user: User;
  stats: UserStatistics;
  bookmarksCount: number;
  onEditProfile: () => void;
  isOwnProfile?: boolean;
}

export interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats: UserStatistics;
  bookmarksCount: number;
  className?: string;
}

export interface BookmarksTabProps {
  bookmarks: Bookmark[];
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}

export interface WatchedTabProps {
  movies: MovieLog[];
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}

export interface OverviewTabProps {
  user: User;
  stats: UserStatistics;
  activities: Activity[];
  bookmarks: Bookmark[];
  onViewAllActivity?: () => void;
}

export interface ActivityTabProps {
  activities: Activity[];
  shouldFocus?: boolean;
}

export interface StatsTabProps {
  user: User;
  stats: UserStatistics;
}

export interface EditProfileModalProps {
  user: User;
  onClose: () => void;
}

// Additional utility types
export interface StatCardProps {
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
}

export interface SidebarItem {
  id: number;
  title: string;
  poster: string;
  subtitle?: string;
  meta: string;
  href: string;
}

export interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  items: SidebarItem[];
  emptyMessage: string;
  viewAllHash: string;
}

export interface Achievement {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  rarity: "common" | "rare" | "legendary";
}

