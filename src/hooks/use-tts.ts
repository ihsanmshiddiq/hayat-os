"use client";

import * as React from "react";

/**
 * useTTS — fetch a TTS audio clip from /api/tts and play it.
 * Caches the most recent audio blob so re-clicking "Listen" replays instantly.
 */
export function useTTS() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const cacheRef = React.useRef<Map<string, string>>(new Map());

  const speak = React.useCallback(async (text: string, key?: string) => {
    const cacheKey = key ?? text;
    if (audioRef.current && activeKey === cacheKey) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    setIsLoading(true);
    setActiveKey(cacheKey);
    try {
      let url = cacheRef.current.get(cacheKey);
      if (!url) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speed: 0.85 }),
        });
        if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        cacheRef.current.set(cacheKey, url);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setActiveKey(null);
      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      setActiveKey(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeKey]);

  const stop = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveKey(null);
  }, []);

  const isPlaying = (key: string) => activeKey === key;

  React.useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return { speak, stop, isLoading, isPlaying, activeKey };
}
