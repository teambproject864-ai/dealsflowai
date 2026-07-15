"use client";

import { useState, useEffect } from "react";
import { Loader2, Clock, CheckCircle, XCircle, Play, RefreshCw } from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import type { HeyGenVideo } from "@/lib/types";

export default function HeyGenStatus() {
  const [videos, setVideos] = useState<HeyGenVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
    const interval = setInterval(loadVideos, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadVideos() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/heygen/videos");
      const data = await res.json();
      if (data.success) {
        // Check each in-progress video for latest status
        const updatedVideos = await Promise.all(
          data.data.map(async (video: HeyGenVideo) => {
            if (
              video.status === "pending" ||
              video.status === "processing"
            ) {
              const statusRes = await fetch(`/api/heygen/videos/${video.id}`);
              const statusData = await statusRes.json();
              if (statusData.success) {
                return statusData.data;
              }
            }
            return video;
          })
        );
        setVideos(updatedVideos);
      }
    } catch (err) {
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const activeVideos = videos.filter(
    (v) => v.status === "pending" || v.status === "processing"
  );
  const completedVideos = videos.filter(
    (v) => v.status === "completed" || v.status === "failed"
  );

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
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100">Status Tracking</h1>
          <p className="text-slate-400 mt-2">
            Monitor your HeyGen video generation jobs in real-time
          </p>
        </div>
        <ExtrudedButton onClick={loadVideos} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </ExtrudedButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin mr-3" />
          <span className="text-slate-400 text-lg">Loading...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {activeVideos.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                In Progress ({activeVideos.length})
              </h2>
              <div className="space-y-4">
                {activeVideos.map((video) => (
                  <GlassPanel
                    key={video.id}
                    tilt={false}
                    className="border-slate-700/50"
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(video.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">
                            {video.title || "Untitled"}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-1">
                            {video.prompt}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-slate-800 text-slate-300 capitalize">
                        {getStatusLabel(video.status)}
                      </span>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </section>
          )}

          {completedVideos.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-200 mb-4">
                Recently Completed ({completedVideos.length})
              </h2>
              <div className="space-y-4">
                {completedVideos.map((video) => (
                  <GlassPanel
                    key={video.id}
                    tilt={false}
                    className="border-slate-700/50"
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(video.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">
                            {video.title || "Untitled"}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-1">
                            {video.prompt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm px-3 py-1 rounded-full bg-slate-800 text-slate-300 capitalize">
                          {getStatusLabel(video.status)}
                        </span>
                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExtrudedButton size="sm" className="bg-teal-600">
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </ExtrudedButton>
                          </a>
                        )}
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </section>
          )}

          {activeVideos.length === 0 && completedVideos.length === 0 && (
            <GlassPanel tilt={false} className="border-slate-700/50">
              <div className="py-16 text-center">
                <div className="text-4xl text-slate-600 mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No video jobs running
                </h3>
                <p className="text-slate-500">
                  Create a video to see it in the status tracker
                </p>
              </div>
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
}
