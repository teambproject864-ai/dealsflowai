"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Search, Play, Clock, CheckCircle, XCircle, Filter } from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import { Input } from "@/components/ui/input";
import type { HeyGenVideo } from "@/lib/types";

export default function HeyGenLibrary() {
  const [videos, setVideos] = useState<HeyGenVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const res = await fetch("/api/heygen/videos");
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.prompt?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  function getStatusIcon(status: HeyGenVideo["status"]) {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  }

  function getStatusLabel(status: HeyGenVideo["status"]) {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-100">Video Library</h1>
        <p className="text-slate-400 mt-2">
          View and manage all your HeyGen generated videos
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos by title or prompt..."
              className="pl-10 bg-black/20 border-white/10 text-white placeholder-slate-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <ExtrudedButton onClick={loadVideos}>Refresh</ExtrudedButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin mr-3" />
          <span className="text-slate-400 text-lg">Loading videos...</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <GlassPanel tilt={false} className="border-slate-700/50">
          <div className="py-16 text-center">
            <div className="text-4xl text-slate-600 mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No videos found
            </h3>
            <p className="text-slate-500 mb-6">
              {search || selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first video to get started"}
            </p>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <GlassPanel
              key={video.id}
              tilt={false}
              className="border-slate-700/50 hover:border-slate-600/50 transition-all"
            >
              <div className="p-5">
                {video.thumbnailUrl ? (
                  <div className="relative aspect-video bg-slate-800 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title || "Video"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {video.videoUrl && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExtrudedButton className="bg-teal-600">
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </ExtrudedButton>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-800 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-4xl text-slate-600">🎥</div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-100 truncate flex-1 mr-2">
                    {video.title || "Untitled"}
                  </h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(video.status)}
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {video.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <span className="capitalize">
                    {getStatusLabel(video.status)}
                  </span>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
