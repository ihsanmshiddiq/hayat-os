"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  ChevronDown,
  AudioLines,
  AlertCircle,
} from "lucide-react";
import { QURAN_RECITERS, SURAHS, surahAudioUrl } from "@/lib/islamic";
import { cn } from "@/lib/utils";

interface RecitationPlayerProps {
  /** Surah number (1-114). Defaults to 1 (Al-Fatihah). */
  initialSurah?: number;
  /** Compact variant for embedding in cards. */
  compact?: boolean;
}

/**
 * Quran Recitation Player.
 * Streams entire-surah audio from the Islamic Network CDN (https://cdn.islamic.network).
 * Includes reciter selector, play/pause, seek, volume, and current time readout.
 */
export function RecitationPlayer({ initialSurah = 1, compact = false }: RecitationPlayerProps) {
  const [reciterId, setReciterId] = React.useState("ar.alafasy");
  const [surah, setSurah] = React.useState(initialSurah);
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);
  const [volume, setVolume] = React.useState(0.85);
  const [muted, setMuted] = React.useState(false);
  const [reciterOpen, setReciterOpen] = React.useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Init audio element on mount
  React.useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    // NOTE: do NOT set crossOrigin — islamic.network CDN doesn't require CORS,
    // and setting it causes the browser to fail the request in sandboxed envs.
    audioRef.current = a;

    const onTime = () => setCurrent(a.currentTime);
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => {
      setLoading(false);
      setError(null);
    };
    const onError = () => {
      setError("Could not load audio. The reciter may be temporarily unavailable.");
      setPlaying(false);
      setLoading(false);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("error", onError);

    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("error", onError);
    };
  }, []);

  // Keep a ref of `playing` so the load effect can read the latest value without
  // re-running every time the user toggles play/pause (which would reload audio).
  const playingRef = React.useRef(playing);
  React.useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Track whether we've ever attempted to load. We defer setting a.src until
  // the user actually clicks play — avoids auto-failing in sandboxed browsers
  // where autoplay/metadata load can be blocked.
  const hasLoadedRef = React.useRef(false);

  // When reciter or surah changes, reset state and (if we were playing) reload
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setError(null);
    setCurrent(0);
    setDuration(0);
    // If we'd previously loaded, swap the src and reload (keep playing if we were)
    if (hasLoadedRef.current) {
      setLoading(true);
      a.src = surahAudioUrl(reciterId, surah);
      a.load();
      if (playingRef.current) {
        a.play().catch(() => {
          setError("Tap play to start recitation.");
          setPlaying(false);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } else {
      // Not loaded yet — just clear any stale state. We'll set src on first play.
      a.removeAttribute("src");
      a.load();
    }
  }, [reciterId, surah]);

  // Volume
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (playing) {
        a.pause();
      } else {
        // Lazy-load the audio src on first play
        if (!hasLoadedRef.current || !a.src) {
          hasLoadedRef.current = true;
          setLoading(true);
          setError(null);
          a.src = surahAudioUrl(reciterId, surah);
          a.load();
        } else {
          setLoading(true);
        }
        await a.play();
      }
    } catch (err) {
      setError("Browser blocked autoplay. Tap again.");
      setPlaying(false);
      setLoading(false);
    }
  };

  const seek = (pct: number) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = (pct / 100) * a.duration;
    setCurrent(a.currentTime);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const surahMeta = SURAHS.find((s) => s.number === surah);
  const reciter = QURAN_RECITERS.find((r) => r.id === reciterId)!;
  const progressPct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card",
        compact ? "p-3" : "p-5"
      )}
    >
      {/* ambient glow when playing */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(420px 180px at 0% 0%, rgba(16,185,129,0.10), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-4">
        {/* Play button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={togglePlay}
          disabled={loading && !playing}
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-soft transition-colors",
            compact ? "h-12 w-12" : "h-14 w-14",
            playing ? "bg-primary" : "bg-primary/90 hover:bg-primary"
          )}
          aria-label={playing ? "Pause recitation" : "Play recitation"}
        >
          {loading && !playing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
          {playing && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.18, 1.18], opacity: [0.7, 0, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.button>

        {/* Track info + progress */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70 mb-0.5">
                <AudioLines className="h-3 w-3" />
                Recitation
              </div>
              <p className="text-sm font-medium truncate">
                {surahMeta ? `${surahMeta.number}. ${surahMeta.name}` : `Surah ${surah}`}
                <span className="text-muted-foreground font-normal"> · {reciter.name}</span>
              </p>
            </div>
            {!compact ? (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums">
                <span>{fmt(current)}</span>
                <span className="text-muted-foreground/40">/</span>
                <span>{fmt(duration)}</span>
              </div>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="group relative h-2 rounded-full bg-muted overflow-hidden cursor-pointer">
            <div
              className="absolute inset-y-0 left-0 bg-primary/80 rounded-full transition-[width] duration-150"
              style={{ width: `${progressPct}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPct}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>

          {compact ? (
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground tabular-nums">
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Surah + reciter selectors */}
      {!compact ? (
        <div className="relative mt-4 grid sm:grid-cols-2 gap-3">
          {/* Surah selector */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Surah
            </label>
            <select
              value={surah}
              onChange={(e) => setSurah(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/40 outline-none cursor-pointer"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} — {s.english} ({s.ayahs} ayahs)
                </option>
              ))}
            </select>
          </div>

          {/* Reciter selector */}
          <div className="relative">
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Reciter
            </label>
            <button
              onClick={() => setReciterOpen((o) => !o)}
              className="mt-1 w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-arabic text-base text-primary truncate">{reciter.arabic}</span>
                <span className="truncate text-muted-foreground">{reciter.name}</span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", reciterOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {reciterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-soft p-1.5"
                >
                  {QURAN_RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setReciterId(r.id);
                        setReciterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left rounded-md px-2.5 py-2 hover:bg-muted/60 transition-colors flex items-center justify-between gap-2",
                        r.id === reciterId && "bg-primary/5"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{r.style}</p>
                      </div>
                      <span className="text-arabic text-base text-primary shrink-0">{r.arabic}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      {/* Volume + error */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setMuted((m) => !m)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          className="flex-1 max-w-32 h-1 accent-primary cursor-pointer"
          aria-label="Volume"
        />
        {error ? (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{error}</span>
            <button
              onClick={() => {
                setError(null);
                hasLoadedRef.current = false;
                const a = audioRef.current;
                if (a) {
                  a.removeAttribute("src");
                  a.load();
                }
              }}
              className="ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-amber-500/15 hover:bg-amber-500/25 transition-colors"
              aria-label="Retry loading audio"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
