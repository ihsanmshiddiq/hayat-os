"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Compass } from "lucide-react";
import { calculateQibla, compassDirection } from "@/lib/islamic";
import { cn } from "@/lib/utils";

/**
 * Premium Qibla compass.
 * - Calculates the great-circle bearing from the user's location to the Kaaba.
 * - Visualizes a rotating compass dial with a qibla needle.
 * - Uses the device's magnetometer if available (via DeviceOrientation), else
 *   falls back to a static "true north" presentation.
 */
export function QiblaCompass({
  lat,
  lng,
  location,
}: {
  lat: number;
  lng: number;
  location?: string | null;
}) {
  const bearing = React.useMemo(() => calculateQibla(lat, lng), [lat, lng]);
  const direction = compassDirection(bearing);

  // Device orientation (true-north heading). iOS requires permission.
  const [heading, setHeading] = React.useState<number | null>(null);
  const [hasSensor, setHasSensor] = React.useState(false);
  const handlerRef = React.useRef<((e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => void) | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const onOrientation = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const h = typeof e.webkitCompassHeading === "number" ? e.webkitCompassHeading : (e.alpha != null ? 360 - e.alpha : null);
      if (h != null && mounted) {
        setHeading(h);
        setHasSensor(true);
      }
    };
    handlerRef.current = onOrientation;

    if (typeof window !== "undefined" && typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
      window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    }

    return () => {
      mounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
        window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
      }
    };
  }, []);

  // Compass dial rotation: if we have a live heading, counter-rotate so North points up.
  // Otherwise dial stays fixed (North up) and only the qibla needle rotates.
  const dialRotation = heading != null ? -heading : 0;
  // Qibla needle rotation is always relative to true north.
  const needleRotation = bearing;

  const aligned = heading != null && Math.abs(((bearing - heading + 540) % 360) - 180) < 5;

  const enableSensor = async () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (D && typeof D.requestPermission === "function") {
      try {
        const res = await D.requestPermission();
        if (res === "granted" && handlerRef.current) {
          window.addEventListener("deviceorientation", handlerRef.current as EventListener, true);
          setHasSensor(true);
        }
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Compass */}
      <div className="relative" style={{ width: 240, height: 240 }}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />

        <motion.div
          animate={{ rotate: dialRotation }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
          className="absolute inset-0 rounded-full border-2 border-border bg-gradient-to-b from-card to-muted/40 shadow-premium"
        >
          {/* Cardinal markers */}
          {[
            { label: "N", angle: 0, major: true },
            { label: "E", angle: 90, major: true },
            { label: "S", angle: 180, major: true },
            { label: "W", angle: 270, major: true },
            { label: "NE", angle: 45, major: false },
            { label: "SE", angle: 135, major: false },
            { label: "SW", angle: 225, major: false },
            { label: "NW", angle: 315, major: false },
          ].map((m) => (
            <div
              key={m.label}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${m.angle}deg) translateY(-110px)`,
                transformOrigin: "center",
                marginLeft: -8,
                marginTop: -8,
              }}
            >
              <span
                className={cn(
                  "inline-block text-xs",
                  m.major ? "font-semibold text-foreground" : "text-muted-foreground/60",
                  m.label === "N" && "text-rose-500 font-bold"
                )}
                style={{ transform: `rotate(${-m.angle - dialRotation}deg)` }}
              >
                {m.label}
              </span>
            </div>
          ))}

          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute left-1/2 top-0",
                i % 9 === 0 ? "w-[2px] h-3 bg-foreground/40" : "w-[1px] h-1.5 bg-muted-foreground/30"
              )}
              style={{ transform: `rotate(${i * 5}deg)`, transformOrigin: "center 120px" }}
            />
          ))}

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary shadow-soft" />
        </motion.div>

        {/* Qibla needle (does NOT rotate with dial — it points to true qibla bearing) */}
        <motion.div
          animate={{ rotate: needleRotation }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="absolute inset-0 flex items-start justify-center pointer-events-none"
        >
          <div className="relative" style={{ marginTop: 18 }}>
            <div className={cn(
              "flex flex-col items-center transition-colors",
              aligned ? "text-primary" : "text-primary/80"
            )}>
              <Compass className={cn("h-7 w-7 drop-shadow", aligned && "animate-pulse")} />
              <div className={cn(
                "w-[3px] rounded-full",
                aligned ? "h-20 bg-primary" : "h-20 bg-primary/70"
              )} />
            </div>
          </div>
        </motion.div>

        {/* Aligned indicator */}
        {aligned && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-soft whitespace-nowrap"
          >
            ★ ALIGNED WITH QIBLA
          </motion.div>
        )}
      </div>

      {/* Bearing readout */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Navigation className="h-4 w-4 text-primary" />
          <span className="text-display text-2xl font-semibold tabular-nums">
            {Math.round(bearing)}°
          </span>
          <span className="text-sm text-muted-foreground">{direction}</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" />
          {location ?? "Your location"} → Makkah
        </p>
        {!hasSensor ? (
          <button
            onClick={enableSensor}
            className="mt-3 text-[11px] text-primary underline-offset-2 hover:underline"
          >
            Enable live compass (device sensor)
          </button>
        ) : heading != null ? (
          <p className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400">
            ● Live heading: {Math.round(heading)}°
          </p>
        ) : null}
      </div>
    </div>
  );
}
