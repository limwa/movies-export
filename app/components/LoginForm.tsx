"use client";

import { useState } from "react";
import {
  getLoginChallengeToken,
  loginAccount,
  getUser,
  getBookmarks,
  getProgress,
  getWatchHistory,
} from "../lib/auth/api";
import {
  keysFromMnemonic,
  bytesToBase64Url,
  signChallenge,
  encryptData,
} from "../lib/auth/crypto";
import { transformData } from "../lib/auth/transform";
import { UserData } from "../lib/data";

interface LoginFormProps {
  onLogin: (data: UserData) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [url, setUrl] = useState("https://backend.pstream.mov");
  const [mnemonic, setMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Generate keys from mnemonic
      const keys = await keysFromMnemonic(mnemonic.trim());
      const publicKeyBase64Url = bytesToBase64Url(keys.publicKey);

      // 2. Get challenge
      const { challenge } = await getLoginChallengeToken(
        url,
        publicKeyBase64Url,
      );

      // 3. Sign challenge
      const signature = await signChallenge(keys, challenge);

      // 4. Encrypt device name
      // Use a fixed device name or let user input it. "movie-web" is standard in the ecosystem.
      const deviceName = "movie-export-visualizer";
      const encryptedDevice = await encryptData(deviceName, keys.seed);

      // 5. Complete login
      const loginResult = await loginAccount(url, {
        challenge: {
          code: challenge,
          signature,
        },
        publicKey: publicKeyBase64Url,
        device: encryptedDevice,
      });

      const token = loginResult.token;

      // 6. Fetch user data
      const { user } = await getUser(url, token);
      const bookmarks = await getBookmarks(url, user.id, token);
      const progress = await getProgress(url, user.id, token);
      const watchHistory = await getWatchHistory(url, user.id, token);

      // 7. Transform and pass data up
      const userData = transformData(bookmarks, progress, watchHistory);
      onLogin(userData);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("401") || err.response?.status === 401) {
        setError("Passphrase is incorrect.");
      } else {
        setError(
          err.message || "Failed to login. Check your credentials and URL.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
        Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Backend URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="https://backend.pstream.mov"
          />
        </div>

        <div>
          <label
            htmlFor="mnemonic"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Passphrase (12 words)
          </label>
          <textarea
            id="mnemonic"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
            placeholder="apple banana cherry..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
