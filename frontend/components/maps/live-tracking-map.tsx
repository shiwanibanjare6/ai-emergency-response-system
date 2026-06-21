"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker, Responder } from "@/types";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { useSocket } from "@/components/providers/socket-provider";

const markerColors = {
  critical: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  responder: "#38bdf8",
  hospital: "#a78bfa",
};

function createIcon(color: string, pulse = false) {
  const pulseStyle = pulse ? "animation:pulse 1.5s infinite;" : "";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color};${pulseStyle}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function LiveTrackingMap({
  markers,
  liveResponders = [],
  center = DEFAULT_MAP_CENTER,
  zoom = 13,
  className = "h-[400px] w-full",
  onMarkerClick,
}: {
  markers: MapMarker[];
  liveResponders?: Responder[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}) {
  const { connected } = useSocket();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [trackedCount, setTrackedCount] = useState(0);

  // Merge live responder positions into markers
  const mergedMarkers: MapMarker[] = markers.map((m) => {
    if (m.type !== "responder") return m;
    const live = liveResponders.find((r) => `r-${r.id}` === m.id);
    if (live) {
      return { ...m, lat: live.lat, lng: live.lng, status: live.status, label: live.username ?? m.label };
    }
    return m;
  });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OSM',
    }).addTo(mapInstance.current);
    layerGroup.current = L.layerGroup().addTo(mapInstance.current);
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRefs.current.clear();
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!layerGroup.current) return;

    const seen = new Set<string>();
    mergedMarkers.forEach((m) => {
      seen.add(m.id);
      let color = markerColors.low;
      if (m.type === "emergency") color = markerColors[m.severity ?? "low"];
      if (m.type === "responder") color = markerColors.responder;
      if (m.type === "hospital") color = markerColors.hospital;

      const isLiveResponder = m.type === "responder" && liveResponders.some((r) => `r-${r.id}` === m.id);
      const existing = markerRefs.current.get(m.id);

      if (existing) {
        existing.setLatLng([m.lat, m.lng]);
        existing.setPopupContent(`<strong>${m.label}</strong><br/>${m.status ?? m.type}${isLiveResponder ? "<br/><em>Live tracking</em>" : ""}`);
      } else {
        const marker = L.marker([m.lat, m.lng], {
          icon: createIcon(color, isLiveResponder && connected),
        }).bindPopup(`<strong>${m.label}</strong><br/>${m.status ?? m.type}`);
        if (onMarkerClick) marker.on("click", () => onMarkerClick(m));
        layerGroup.current?.addLayer(marker);
        markerRefs.current.set(m.id, marker);
      }
    });

    markerRefs.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        layerGroup.current?.removeLayer(marker);
        markerRefs.current.delete(id);
      }
    });

    setTrackedCount(liveResponders.length);
  }, [mergedMarkers, liveResponders, connected, onMarkerClick]);

  return (
    <div className="relative">
      <div ref={mapRef} className={`rounded-xl border border-zinc-800 overflow-hidden ${className}`} />
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-xs">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500 pulse-critical" : "bg-zinc-500"}`} />
        {connected ? `Live · ${trackedCount} units tracked` : "Connecting..."}
      </div>
    </div>
  );
}
