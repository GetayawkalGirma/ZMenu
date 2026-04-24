"use client";

import { useState, useCallback } from "react";
import {
  Send,
  X,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Film,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import type { TelegramPost } from "@/app/api/telegram/route";

const DEFAULT_CHANNEL = "Foodism11";

type Stage = "idle" | "searching" | "results" | "downloading" | "done" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  mealNames: string[];
  onImagesAdded: (count: number) => void;
}

export default function TelegramSearchModal({
  open,
  onClose,
  restaurantId,
  restaurantName,
  mealNames,
  onImagesAdded,
}: Props) {
  const [channel, setChannel] = useState(DEFAULT_CHANNEL);
  const [customChannel, setCustomChannel] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [notFoundInDefault, setNotFoundInDefault] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalScanned, setTotalScanned] = useState(0);

  const activeChannel = useCustom ? customChannel.trim().replace(/^@/, "") : channel;

  const reset = useCallback(() => {
    setStage("idle");
    setPosts([]);
    setSelected(new Set());
    setErrorMsg("");
    setNotFoundInDefault(false);
    setAddedCount(0);
    setErrorCount(0);
    setUseCustom(false);
    setCustomChannel("");
    setChannel(DEFAULT_CHANNEL);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSearch = useCallback(async () => {
    const ch = activeChannel;
    if (!ch) return;
    setStage("searching");
    setErrorMsg("");
    setPosts([]);
    setSelected(new Set());
    setNotFoundInDefault(false);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          restaurantName,
          channel: ch,
          mealNames: mealNames.slice(0, 5),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.notFound && ch === DEFAULT_CHANNEL) {
          setNotFoundInDefault(true);
          setStage("error");
          setErrorMsg(`Could not find @${ch}. Try a different channel.`);
          return;
        }
        throw new Error(data.error || "Search failed");
      }

      setPosts(data.posts || []);
      setTotalScanned(data.totalScanned || 0);

      if ((data.posts || []).length === 0 && ch === DEFAULT_CHANNEL) {
        // No results in default channel — prompt to try another
        setNotFoundInDefault(true);
        setStage("error");
        setErrorMsg(
          `No posts about "${restaurantName}" found in @${ch}. Try a different Telegram channel.`
        );
      } else {
        setStage("results");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setStage("error");
    }
  }, [activeChannel, restaurantName, mealNames]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(posts.map((p) => p.id)));
  const clearAll = () => setSelected(new Set());

  const handleDownload = useCallback(async () => {
    const toDownload = posts.filter((p) => selected.has(p.id));
    if (toDownload.length === 0) return;
    setStage("downloading");

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          restaurantId,
          channel: activeChannel,
          selectedPosts: toDownload.map((p) => ({
            trackId: p.trackId,
            messageIds: p.messageIds,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download failed");

      setAddedCount(data.added || 0);
      setErrorCount(data.errors || 0);
      setStage("done");
      onImagesAdded(data.added || 0);
    } catch (err: any) {
      setErrorMsg(err.message || "Download failed");
      setStage("error");
    }
  }, [posts, selected, restaurantId, activeChannel, onImagesAdded]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                Find on Telegram
              </h2>
              <p className="text-[10px] text-gray-400 truncate max-w-[220px]">
                {restaurantName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel selector */}
        <div className="flex-none px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Telegram Channel
          </p>
          {!useCustom ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800">
                <span className="text-gray-400">@</span>
                {DEFAULT_CHANNEL}
              </div>
              <button
                onClick={() => setUseCustom(true)}
                className="px-3 py-2 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Use other
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100">
                <span className="text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  placeholder="channel_username"
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 text-sm outline-none text-gray-800 font-medium bg-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { setUseCustom(false); setCustomChannel(""); }}
                className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Idle: search prompt */}
          {stage === "idle" && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Search className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Search for "{restaurantName}" posts
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll scan @{activeChannel || DEFAULT_CHANNEL} using Telegram's native search.
                  You can approve which posts to pull images from.
                </p>
              </div>
              {mealNames.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  <span className="text-[10px] text-gray-400 w-full mb-1">Also searching for meal names:</span>
                  {mealNames.slice(0, 5).map((n) => (
                    <span key={n} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {n}
                    </span>
                  ))}
                  {mealNames.length > 5 && (
                    <span className="text-[10px] text-gray-400">+{mealNames.length - 5} more</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Searching spinner */}
          {stage === "searching" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Searching @{activeChannel}…</p>
            </div>
          )}

          {/* Results */}
          {stage === "results" && (
            <div className="px-5 py-3">
              {/* Summary bar */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-800">{posts.length}</span>{" "}
                  post{posts.length !== 1 ? "s" : ""} found
                  {totalScanned > 0 && (
                    <span className="text-gray-400"> · {totalScanned} messages scanned</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-gray-300">·</span>
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-bold text-gray-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Post cards */}
              <div className="space-y-2">
                {posts.map((post) => {
                  const isSelected = selected.has(post.id);
                  return (
                    <div
                      key={post.id}
                      onClick={() => toggleSelect(post.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 flex-none w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.imageCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <ImageIcon className="w-3 h-3" />
                              {post.imageCount} photo{post.imageCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {post.videoCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                              <Film className="w-3 h-3" />
                              {post.videoCount} video{post.videoCount !== 1 ? "s" : ""} (thumbnail)
                            </span>
                          )}
                          {post.matchedTerms.map((term) => (
                            <span
                              key={term}
                              className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full truncate max-w-[100px]"
                              title={term}
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                        {post.text ? (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {post.text}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No caption</p>
                        )}
                        <p className="text-[9px] text-gray-400 mt-1">
                          Post #{post.trackId}
                        </p>
                      </div>

                      <ChevronRight
                        className={`flex-none w-4 h-4 mt-1 transition-colors ${
                          isSelected ? "text-blue-400" : "text-gray-200"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* No results fallback */}
              {posts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No matching posts with photos found.</p>
                </div>
              )}
            </div>
          )}

          {/* Downloading */}
          {stage === "downloading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                Downloading {selected.size} post{selected.size !== 1 ? "s" : ""}…
              </p>
              <p className="text-xs text-gray-400">This may take a moment</p>
            </div>
          )}

          {/* Done */}
          {stage === "done" && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-black text-gray-900">
                  {addedCount} image{addedCount !== 1 ? "s" : ""} added!
                </p>
                {errorCount > 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    {errorCount} failed — you can retry those manually.
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  The library panel has been refreshed.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Search again
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Search failed</p>
                <p className="text-xs text-gray-500 mt-1">{errorMsg}</p>
              </div>
              {notFoundInDefault && !useCustom && (
                <button
                  onClick={() => {
                    setUseCustom(true);
                    setStage("idle");
                    setErrorMsg("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Try a different channel
                </button>
              )}
              <button
                onClick={reset}
                className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-none flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
          {stage === "idle" || stage === "error" ? (
            <>
              <span className="text-[10px] text-gray-400">
                Uses your saved Telegram session
              </span>
              <button
                onClick={handleSearch}
                disabled={!activeChannel}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </>
          ) : stage === "results" ? (
            <>
              <span className="text-xs text-gray-500">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-search
                </button>
                <button
                  onClick={handleDownload}
                  disabled={selected.size === 0}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-40 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {selected.size > 0 ? `(${selected.size})` : ""}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
