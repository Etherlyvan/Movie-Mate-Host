export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movie Mate";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
export const TMDB_IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p/w500";

export const MOVIE_STATUSES = {
  WATCHED: "watched",
  WATCHING: "watching",
  WANT_TO_WATCH: "want_to_watch",
  DROPPED: "dropped",
} as const;

export const MOVIE_STATUS_LABELS = {
  [MOVIE_STATUSES.WATCHED]: "Watched",
  [MOVIE_STATUSES.WATCHING]: "Currently Watching",
  [MOVIE_STATUSES.WANT_TO_WATCH]: "Want to Watch",
  [MOVIE_STATUSES.DROPPED]: "Dropped",
};

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: "w200",
    MEDIUM: "w500",
    LARGE: "w780",
    ORIGINAL: "original",
  },
  BACKDROP: {
    SMALL: "w300",
    MEDIUM: "w780",
    LARGE: "w1280",
    ORIGINAL: "original",
  },
  PROFILE: {
    SMALL: "w45",
    MEDIUM: "w185",
    LARGE: "h632",
    ORIGINAL: "original",
  },
};

export const ROUTES = {
  HOME: "/",
  MOVIES: "/movies",
  MOVIE_DETAILS: "/movies/[id]",
  SEARCH: "/movies/search",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export const QUERY_KEYS = {
  POPULAR_MOVIES: "popular-movies",
  TRENDING_MOVIES: "trending-movies",
  TOP_RATED_MOVIES: "top-rated-movies",
  MOVIE_DETAILS: "movie-details",
  SEARCH_MOVIES: "search-movies",
  GENRES: "genres",
  USER_PROFILE: "user-profile",
  WATCHLIST: "watchlist",
} as const;
