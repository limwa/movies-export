import { ofetch } from "ofetch";

export interface ChallengeTokenResponse {
  challenge: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  token: string;
  device: string;
  createdAt: string;
  expiresAt: string;
}

export interface LoginResponse {
  session: SessionResponse;
  token: string;
}

export interface LoginInput {
  publicKey: string;
  challenge: {
    code: string;
    signature: string;
  };
  device: string;
}

export async function getLoginChallengeToken(
  url: string,
  publicKey: string,
): Promise<ChallengeTokenResponse> {
  return ofetch<ChallengeTokenResponse>("/auth/login/start", {
    method: "POST",
    body: {
      publicKey,
    },
    baseURL: url,
  });
}

export async function loginAccount(
  url: string,
  data: LoginInput,
): Promise<LoginResponse> {
  return ofetch<LoginResponse>("/auth/login/complete", {
    method: "POST",
    body: {
      namespace: "movie-web",
      ...data,
    },
    baseURL: url,
  });
}

export interface UserResponse {
  id: string;
  namespace: string;
  nickname: string;
  permissions: string[];
  profile: {
    colorA: string;
    colorB: string;
    icon: string;
  };
}

export async function getUser(
  url: string,
  token: string,
): Promise<{ user: UserResponse; session: SessionResponse }> {
  return ofetch<{ user: UserResponse; session: SessionResponse }>(
    "/users/@me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      baseURL: url,
    },
  );
}

export interface BookmarkResponse {
  tmdbId: string;
  meta: {
    title: string;
    year: number;
    poster?: string;
    type: "show" | "movie";
  };
  group: string[];
  favoriteEpisodes?: string[];
  updatedAt: string;
}

export async function getBookmarks(url: string, userId: string, token: string) {
  return ofetch<BookmarkResponse[]>(`/users/${userId}/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseURL: url,
  });
}

export interface ProgressResponse {
  tmdbId: string;
  season: {
    id?: string;
    number?: number;
  };
  episode: {
    id?: string;
    number?: number;
  };
  meta: {
    title: string;
    year: number;
    poster?: string;
    type: "show" | "movie";
  };
  duration: string;
  watched: string;
  updatedAt: string;
}

export async function getProgress(url: string, userId: string, token: string) {
  return ofetch<ProgressResponse[]>(`/users/${userId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseURL: url,
  });
}

export interface WatchHistoryResponse {
  tmdbId: string;
  season: {
    id?: string;
    number?: number;
  };
  episode: {
    id?: string;
    number?: number;
  };
  meta: {
    title: string;
    year: number;
    poster?: string;
    type: "show" | "movie";
  };
  duration: string;
  watched: string;
  watchedAt: string;
  completed: boolean;
}

export async function getWatchHistory(
  url: string,
  userId: string,
  token: string,
) {
  return ofetch<WatchHistoryResponse[]>(`/users/${userId}/watch-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseURL: url,
  });
}
