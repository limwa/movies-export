import { UserData } from "../data";
import {
  BookmarkResponse,
  ProgressResponse,
  WatchHistoryResponse,
} from "./api";

export function transformData(
  bookmarks: BookmarkResponse[],
  progress: ProgressResponse[],
  watchHistory: WatchHistoryResponse[],
): UserData {
  return {
    bookmarks: transformBookmarks(bookmarks),
    progress: transformProgress(progress),
    watchHistory: transformWatchHistory(watchHistory),
  };
}

function transformBookmarks(
  responses: BookmarkResponse[],
): UserData["bookmarks"] {
  const result: UserData["bookmarks"] = {};

  for (const b of responses) {
    result[b.tmdbId] = {
      type: b.meta.type,
      title: b.meta.title,
      year: b.meta.year,
      poster: b.meta.poster as any,
      updatedAt: new Date(b.updatedAt).getTime(),
      group: b.group,
      favoriteEpisodes: (b.favoriteEpisodes || []) as any,
    };
  }
  return result;
}

function transformProgress(
  responses: ProgressResponse[],
): UserData["progress"] {
  const result: UserData["progress"] = {};

  for (const p of responses) {
    if (!result[p.tmdbId]) {
      // Initialize the entry if it doesn't exist
      if (p.meta.type === "movie") {
        result[p.tmdbId] = {
          type: "movie",
          title: p.meta.title,
          year: p.meta.year,
          poster: p.meta.poster as any,
          updatedAt: 0,
          episodes: {},
          seasons: {},
          progress: { duration: 0, watched: 0 },
        };
      } else {
        result[p.tmdbId] = {
          type: "show",
          title: p.meta.title,
          year: p.meta.year,
          poster: p.meta.poster as any,
          updatedAt: 0,
          episodes: {},
          seasons: {},
        };
      }
    }

    const item = result[p.tmdbId];
    const itemUpdatedAt = new Date(p.updatedAt).getTime();
    if (itemUpdatedAt > item.updatedAt) {
      item.updatedAt = itemUpdatedAt;
    }

    const progressData = {
      duration: Number(p.duration),
      watched: Number(p.watched),
    };

    if (item.type === "movie") {
      item.progress = progressData;
    } else if (item.type === "show") {
      if (p.season.id) {
        item.seasons[p.season.id] = {
          id: p.season.id,
          number: p.season.number || 0,
          title: "",
        };
      }
      if (p.episode.id && p.season.id) {
        item.episodes[p.episode.id] = {
          id: p.episode.id,
          number: p.episode.number || 0,
          title: "",
          progress: progressData,
          seasonId: p.season.id,
          updatedAt: itemUpdatedAt,
        };
      }
    }
  }

  return result;
}

function transformWatchHistory(
  responses: WatchHistoryResponse[],
): UserData["watchHistory"] {
  const result: UserData["watchHistory"] = {};

  for (const w of responses) {
    // Generate key: ID for movies, ID-EpisodeID for shows to avoid collisions
    const key = w.episode?.id ? `${w.tmdbId}-${w.episode.id}` : w.tmdbId;

    const base = {
      title: w.meta.title,
      poster: w.meta.poster as any,
      year: w.meta.year,
      progress: {
        duration: Number(w.duration),
        watched: Number(w.watched),
      },
      watchedAt: new Date(w.watchedAt).getTime(),
      completed: w.completed,
    };

    if (w.meta.type === "movie") {
      result[key as any] = {
        type: "movie",
        ...base,
      };
    } else {
      result[key as any] = {
        type: "show",
        ...base,
        seasonId: w.season?.id || "",
        episodeId: w.episode?.id || "",
        seasonNumber: w.season?.number || 0,
        episodeNumber: w.episode?.number || 0,
      };
    }
  }

  return result;
}
