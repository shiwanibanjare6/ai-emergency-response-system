"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "@/types";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";

const markerColors = {
  critical: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  responder: "#38bdf8",
  hospital: "#a78bfa",
};

function createIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function EmergencyMap({
  markers,
  center = DEFAULT_MAP_CENTER,
  zoom = 13,
  className = "h-[400px] w-full",
  onMarkerClick,
}: {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(mapInstance.current);
    layerGroup.current = L.layerGroup().addTo(mapInstance.current);
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;
    layerGroup.current.clearLayers();
    markers.forEach((m) => {
      let color = markerColors.low;
      if (m.type === "emergency") color = markerColors[m.severity ?? "low"];
      if (m.type === "responder") color = markerColors.responder;
      if (m.type === "hospital") color = markerColors.hospital;
      const marker = L.marker([m.lat, m.lng], { icon: createIcon(color) }).bindPopup(
        `<strong>${m.label}</strong><br/>${m.status ?? m.type}`
      );
      if (onMarkerClick) marker.on("click", () => onMarkerClick(m));
      layerGroup.current?.addLayer(marker);
    });
  }, [markers, onMarkerClick]);

  return <div ref={mapRef} className={`rounded-xl border border-zinc-800 overflow-hidden ${className}`} />;
}
