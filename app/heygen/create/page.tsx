"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, User } from "lucide-react";
import { GlassPanel, ExtrudedButton } from "@/components/immersive";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { HeyGenAvatar } from "@/lib/types";

export default function HeyGenCreate() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<HeyGenAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAvatars();
  }, []);

  async function loadAvatars() {
    try {
      const res = await fetch("/api/heygen/avatars");
      const data = await res.json();
      if (data.success) setAvatars(data.data);
    } catch (err) {
      console.error("Error loading avatars:", err);
      setError("Failed to load avatars");
    } finally {
      setLoadingAvatars(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/heygen/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          title: title || "Untitled Video",
          avatarId: selectedAvatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/heygen/status");
      } else {
        setError(data.error || "Failed to create video");
      }
    } catch (err) {
      console.error("Error creating video:", err);
      setError("Failed to create video");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-100">Create New Video</h1>
        <p className="text-slate-400 mt-2">
          Use HeyGen AI to generate professional videos from text prompts
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassPanel tilt={false} className="border-slate-700/50">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Video"
                className="bg-black/20 border-white/10 text-white placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Video Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create..."
                className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[200px]"
              />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tilt={false} className="border-slate-700/50">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">
              Select Avatar
            </h3>
            {loadingAvatars ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-teal-400 animate-spin mr-2" />
                <span className="text-slate-400">Loading avatars...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {avatars.map((avatar) => (
                  <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                    selectedAvatar === avatar.id
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-slate-700/50 hover:border-teal-500/30 bg-white/5"
                  }`}
                >
                  {avatar.thumbnailUrl ? (
                    <img
                      src={avatar.thumbnailUrl}
                      alt={avatar.name}
                      className="w-full aspect-square rounded-lg object-cover mb-3"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                      <User className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-slate-100">{avatar.name}</p>
                  {avatar.language && (
                    <p className="text-xs text-slate-500">{avatar.language}</p>
                  )}
                </div>
                ))}
              </div>
            )}
          </div>
        </GlassPanel>

        <div className="flex items-center gap-4">
          <ExtrudedButton
            type="button"
            variant="outline"
            onClick={() => router.push("/heygen")}
          >
            Cancel
          </ExtrudedButton>
          <ExtrudedButton
            type="submit"
            disabled={isSubmitting || !prompt.trim()}
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Generate Video
              </>
            )}
          </ExtrudedButton>
        </div>
      </form>
    </div>
  );
}
