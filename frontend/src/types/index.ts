export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  credits?: Credits;
  videos?: Videos;
  reviews?: Reviews;
  similar?: MovieResponse;
  recommendations?: MovieResponse;
  isBookmarked?: boolean;
}

export interface MovieDetails extends Movie {
  belongs_to_collection?: any;
  budget: number;
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  credits?: Credits;
  videos?: Videos;
  reviews?: Reviews;
  similar?: MovieResponse;
  recommendations?: MovieResponse;
  isBookmarked?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Videos {
  results: Video[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Reviews {
  results: Review[];
  total_pages: number;
  total_results: number;
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Bookmark {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  dateAdded: string;
}

// frontend/src/types/user.ts
export interface User {
  _id: string;
  username: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  statistics: UserStatistics;
  movieLogs: MovieLog[];
  watchlist: WatchlistItem[];
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  avatar: string | null;
  displayName?: string;
  bio: string;
  favoriteGenres: string[];
  dateOfBirth?: Date;
  country?: string;
  location?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isPublic: boolean;
  joinedDate: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    newReleases: boolean;
    recommendations: boolean;
  };
  privacy: {
    showProfile: boolean;
    showWatchlist: boolean;
    showActivity: boolean;
  };
  display: {
    moviesPerPage: number;
    defaultView: 'grid' | 'list';
  };
}

export interface UserStatistics {
  totalMoviesWatched: number;
  totalWatchTime: number;
  averageRating: number;
  favoriteGenre?: string;
  watchingStreak: number;
  lastActivityDate?: Date;
}

export interface MovieLog {
  _id?: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  status: 'watched' | 'watching' | 'want_to_watch' | 'dropped';
  rating?: number;
  review?: string;
  dateAdded: Date;
  dateWatched?: Date;
  progress: number;
}

export interface WatchlistItem {
  _id?: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  dateAdded: Date;
}

export interface Activity {
  type: 'watched' | 'bookmarked' | 'rated' | 'reviewed';
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  rating?: number;
  date: string;
  review?: string;
}
