type BookmarkId = string;
type BookmarkEntry = {
  year: number,
  title: string,
  poster: URL,
  group?: string[],
  updatedAt: number,
} & (
  | {
    type: "movie"
    favoriteEpisodes: []
  }
  | {
    type: "show"
    favoriteEpisodes: EpisodeId[]
  }
  );

type SeasonId = string;
type EpisodeId = string;
type WatchProgress = {
  duration: number,
  watched: number,  
}

type EpisodeProgressEntry = {
  id: EpisodeId,
  number: number,
  title: "",
  progress: WatchProgress,
  seasonId: SeasonId,
  updatedAt: number,
}

type SeasonProgressEntry = {
  id: SeasonId,
  number: number,
  title: string,
}

type ProgressEntry = {
  title: string,
  poster: URL,
  updatedAt: number,
  year: number,
  episodes: Record<EpisodeId, EpisodeProgressEntry>,
  seasons: Record<SeasonId, SeasonProgressEntry>,
} & (
  | { 
    type: "movie"
    progress: WatchProgress,    
  }
  | {
    type: "show"
  }
)

type WatchHistoryEntry = {
  title: string,
  poster: URL,
  year: number,
  progress: WatchProgress,
  watchedAt: number,
  completed: boolean,
} & (
  | {
    type: "movie"
  }
  | {
    type: "show",
    seasonId: SeasonId,
    episodeId: EpisodeId,
    seasonNumber: number,
    episodeNumber: number,
   }
)

export type UserData = {
  bookmarks: Record<BookmarkId, BookmarkEntry>,
  progress: Record<BookmarkId, ProgressEntry>,
  watchHistory: Record<BookmarkId | `${BookmarkId}-${EpisodeId}`, WatchHistoryEntry>,
}