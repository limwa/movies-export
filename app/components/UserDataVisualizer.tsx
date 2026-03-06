"use client";

import { useState, useEffect } from "react";
import { UserData } from "../lib/data";
import { ItemDetail } from "./ItemDetail";
import { LoginForm } from "./LoginForm";

type BookmarkEntry = UserData["bookmarks"][string] & { id: string };
type ProgressEntry = UserData["progress"][string] & { id: string };
type WatchHistoryEntry = UserData["watchHistory"][string] & { id: string };

interface UserDataVisualizerProps {
  data?: UserData;
}

type Tab = "bookmarks" | "history" | "progress";

export function UserDataVisualizer({
  data: initialData,
}: UserDataVisualizerProps) {
  const [data, setData] = useState<UserData | undefined>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>("bookmarks");
  const [viewId, setViewId] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"upload" | "login">("login");

  useEffect(() => {
    const stored = localStorage.getItem("mw-user-data");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center text-slate-800 dark:text-slate-100">
        <div className="mb-8 flex space-x-4 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setImportMode("login")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              importMode === "login"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Login with Passphrase
          </button>
          <button
            onClick={() => setImportMode("upload")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              importMode === "upload"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Upload File
          </button>
        </div>

        {importMode === "login" ? (
          <LoginForm
            onLogin={(d) => {
              setData(d);
              try {
                localStorage.setItem("mw-user-data", JSON.stringify(d));
              } catch (storageError) {
                console.error("LocalStorage error:", storageError);
                alert(
                  "Data loaded, but could not be saved to browser storage (quota exceeded).",
                );
              }
            }}
          />
        ) : (
          <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div>
              <h1 className="text-3xl font-bold text-center mb-2">
                Import Data
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm">
                Visualize your pstream.mov watch history and bookmarks.
              </p>
            </div>

            <div className="space-y-4 text-left bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">
                Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://pstream.mov/migration/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    pstream.mov/migration/download
                  </a>
                </li>
                <li>Download your data JSON file</li>
                <li>Upload the file below</li>
              </ol>
            </div>

            <div className="pt-2">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const json = JSON.parse(e.target?.result as string);
                      setData(json);
                      try {
                        localStorage.setItem(
                          "mw-user-data",
                          JSON.stringify(json),
                        );
                      } catch (storageError) {
                        console.error("LocalStorage error:", storageError);
                        alert(
                          "Data loaded, but could not be saved to browser storage (quota exceeded). You will need to upload the file again next time.",
                        );
                      }
                    } catch (err) {
                      alert("Invalid JSON file");
                    }
                  };
                  reader.readAsText(file);
                }}
                className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                file:cursor-pointer hover:file:bg-blue-700
                cursor-pointer
              "
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewId) {
    return (
      <ItemDetail data={data} id={viewId} onBack={() => setViewId(null)} />
    );
  }

  const bookmarks = Object.entries(data.bookmarks)
    .map(([id, entry]) => ({
      ...entry,
      id,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const history = Object.entries(data.watchHistory)
    .map(([id, entry]) => ({ ...entry, id }))
    .sort((a, b) => b.watchedAt - a.watchedAt);
  const progress = Object.entries(data.progress)
    .map(([id, entry]) => ({ ...entry, id }))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const stats = {
    totalBookmarks: bookmarks.length,
    moviesBookmarked: bookmarks.filter((b) => b.type === "movie").length,
    showsBookmarked: bookmarks.filter((b) => b.type === "show").length,
    historyEntries: history.length,
    inProgress: progress.length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-6 space-y-8 text-slate-800 dark:text-slate-100">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            User Data Dashboard
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("mw-user-data");
              setData(undefined);
            }}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
          >
            Go back to Import page
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Bookmarks" value={stats.totalBookmarks} />
          <StatCard label="Movies" value={stats.moviesBookmarked} />
          <StatCard label="Shows" value={stats.showsBookmarked} />
          <StatCard label="History Entries" value={stats.historyEntries} />
          <StatCard label="In Progress" value={stats.inProgress} />
        </div>
      </header>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton
            active={activeTab === "bookmarks"}
            onClick={() => setActiveTab("bookmarks")}
            label="Bookmarks"
            count={bookmarks.length}
          />
          <TabButton
            active={activeTab === "progress"}
            onClick={() => setActiveTab("progress")}
            label="In Progress"
            count={progress.length}
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            label="Watch History"
            count={history.length}
          />
        </nav>
      </div>

      <main className="min-h-[500px]">
        {activeTab === "bookmarks" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bookmarks.map((item) => (
              <Card
                key={item.id}
                item={item}
                onClick={() => setViewId(item.id)}
              />
            ))}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progress.map((item) => (
              <ProgressCard
                key={item.id}
                item={item}
                onClick={() => setViewId(item.id)}
              />
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                onClick={() => {
                  let bookmarkId = item.id;
                  if (item.type === "show") {
                    const suffix = `-${item.episodeId}`;
                    if (item.id.endsWith(suffix)) {
                      bookmarkId = item.id.slice(0, -suffix.length);
                    }
                  }
                  setViewId(bookmarkId);
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
        ${
          active
            ? "border-blue-500 text-blue-600 dark:text-blue-400"
            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        }
      `}
    >
      {label}
      <span
        className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium ${
          active
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Card({ item, onClick }: { item: BookmarkEntry; onClick: () => void }) {
  const posterUrl = item.poster?.toString();
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 text-left"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2"
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {item.year} • <span className="capitalize">{item.type}</span>
        </p>
      </div>
    </button>
  );
}

function ProgressCard({
  item,
  onClick,
}: {
  item: ProgressEntry;
  onClick: () => void;
}) {
  const posterUrl = item.poster?.toString();

  // Calculate aggregate progress for display if possible, or show "in progress"
  let progressText = "In Progress";
  let percent = 0;

  if (item.type === "movie") {
    const { watched, duration } = item.progress;
    if (duration > 0) {
      percent = Math.round((watched / duration) * 100);
      progressText = `${percent}% Watched`;
    }
  } else if (item.type === "show") {
    // For shows, we might check how many episodes are in progress or watched
    // The schema has `episodes` map.
    const epCount = Object.keys(item.episodes || {}).length;
    progressText = `${epCount} Episode${epCount === 1 ? "" : "s"} Active`;
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 text-left"
    >
      <div className="w-24 shrink-0 bg-slate-200 dark:bg-slate-700">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center p-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {item.year} • <span className="capitalize">{item.type}</span>
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 mb-1">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500">{progressText}</p>
        <p className="text-xs text-slate-400 mt-2">
          Updated: {new Date(item.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </button>
  );
}

function HistoryRow({
  item,
  onClick,
}: {
  item: WatchHistoryEntry;
  onClick: () => void;
}) {
  const posterUrl = item.poster?.toString();
  const date = new Date(item.watchedAt);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center space-x-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50 text-left"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {item.title}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {item.type === "show"
            ? `S${item.seasonNumber} : E${item.episodeNumber}`
            : "Movie"}{" "}
          • {item.year}
        </p>
        {item.completed && (
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400">
            Completed
          </span>
        )}
      </div>
      <div className="text-right text-sm text-slate-500 dark:text-slate-400 shrink-0">
        <div>{date.toLocaleDateString()}</div>
        <div className="text-xs opacity-70">
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </button>
  );
}
