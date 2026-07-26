"use client";

import * as React from "react";

/**
 * useGeolocation — wraps navigator.geolocation.watchPosition with React state.
 * Returns the latest position (or null), permission state, error, and a
 * `request` function to trigger a fresh high-accuracy read.
 */
export interface GeoCoords {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type GeoPermission = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

export function useGeolocation() {
  const [coords, setCoords] = React.useState<GeoCoords | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [permission, setPermission] = React.useState<GeoPermission>("unknown");
  const [loading, setLoading] = React.useState(false);
  const watchIdRef = React.useRef<number | null>(null);

  const request = React.useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setPermission("unsupported");
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
        setPermission("granted");
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setPermission("denied");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can still enter your city manually."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Position unavailable. Try entering your city manually."
            : err.code === err.TIMEOUT
            ? "Timed out waiting for location. Try again."
            : err.message
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setPermission("unsupported");
      return;
    }
    // Start watching position when permission is already granted
    if (permission === "granted") {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
      watchIdRef.current = id;
    }
    return () => {
      const id = watchIdRef.current;
      if (typeof id === "number") navigator.geolocation.clearWatch(id);
    };
  }, [permission]);

  return { coords, error, permission, loading, request };
}
