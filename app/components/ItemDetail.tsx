"use client";

import { UserData } from "../lib/data";

type ProgressEntry = UserData["progress"][string];

interface ItemDetailProps {
  data: UserData;
  id: string;
  onBack: () => void;
}

export function ItemDetail({ data, id, onBack }: ItemDetailProps) {
  const bookmark = data.bookmarks[id];
  const progressItem = data.progress[id];

  const item = bookmark || progressItem;

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-slate-900 dark:text-slate-100">
        <h1 className="text-2xl font-bold">Item not found</h1>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const title = bookmark?.title ?? progressItem?.title ?? "";
  const posterUrl = (bookmark?.poster ?? progressItem?.poster)?.toString();
  const type = bookmark?.type ?? progressItem?.type ?? "unknown";
  const year = bookmark?.year ?? progressItem?.year;
  const group = bookmark?.group;

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-8"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-full md:w-64 shrink-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-slate-200 dark:bg-slate-700">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 dark:text-slate-400 mb-6">
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-medium capitalize">
                {type}
              </span>
              <span>{year}</span>
              {group && group.length > 0 && (
                <span>Group: {group.join(", ")}</span>
              )}
              <a
                href={`https://www.themoviedb.org/${type === "movie" ? "movie" : "tv"}/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-0.5"
              >
                TMDB ↗
              </a>
            </div>

            {/* Overall Progress for Movies */}
            {progressItem && progressItem.type === "movie" && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Watch Progress</h3>
                <ProgressBar progress={progressItem.progress} />
              </div>
            )}

            {!progressItem && (
              <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                No progress recorded.
              </div>
            )}
          </div>
        </div>

        {/* Episodes List for Shows */}
        {progressItem && progressItem.type === "show" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-slate-200 dark:border-slate-700 pb-4">
              Episodes Progress
            </h2>
            <SeasonsList progressItem={progressItem} showId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  progress,
}: {
  progress: { watched: number; duration: number };
}) {
  const { watched, duration } = progress;
  if (duration === 0) return null;

  const percent = Math.min(100, Math.max(0, (watched / duration) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
        <span>{Math.round(percent)}% Watched</span>
        <span>
          {formatTime(watched)} / {formatTime(duration)}
        </span>
      </div>
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m.toString().padStart(2, "0");
  const sStr = s.toString().padStart(2, "0");

  if (h > 0) return `${h}:${mStr}:${sStr}`;
  return `${m}:${sStr}`;
}

function SeasonsList({
  progressItem,
  showId,
}: {
  progressItem: ProgressEntry;
  showId: string;
}) {
  // Sort seasons by number
  const seasons = Object.values(progressItem.seasons || {}).sort(
    (a, b) => a.number - b.number,
  );

  const episodes = Object.values(progressItem.episodes || {});

  return (
    <div className="space-y-6">
      {seasons.map((season) => {
        const seasonEpisodes = episodes
          .filter((e) => e.seasonId === season.id)
          .sort((a, b) => a.number - b.number);

        if (seasonEpisodes.length === 0) return null;

        return (
          <div
            key={season.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
          >
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {season.title || `Season ${season.number}`}
              </h3>
              <span className="text-sm text-slate-500">
                {seasonEpisodes.length} Episodes
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {seasonEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-sm w-12 shrink-0">
                          S{season.number.toString().padStart(2, "0")}E
                          {ep.number.toString().padStart(2, "0")}
                        </span>
                        <span className="font-medium truncate">
                          {ep.title || `Episode ${ep.number}`}
                        </span>
                        <a
                          href={`https://www.themoviedb.org/tv/${showId}/season/${season.number}/episode/${ep.number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline shrink-0"
                        >
                          TMDB ↗
                        </a>
                      </div>
                    </div>
                    <div className="w-full sm:w-72 shrink-0">
                      <ProgressBar progress={ep.progress} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
