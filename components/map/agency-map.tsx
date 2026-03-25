"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

type MapMarker = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "property" | "spotting";
  latitude: number;
  longitude: number;
};

type Props = {
  token?: string;
  markers: MapMarker[];
};

const DEFAULT_CENTER: [number, number] = [2.3488, 48.8534];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function AgencyMap({ token, markers }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [kindFilter, setKindFilter] = useState<"all" | "property" | "spotting">("all");

  const filteredMarkers = useMemo(() => {
    if (kindFilter === "all") return markers;
    return markers.filter((marker) => marker.kind === kindFilter);
  }, [kindFilter, markers]);

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: 11.2,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    const map = mapRef.current;

    if (filteredMarkers.length === 0) {
      map.easeTo({ center: DEFAULT_CENTER, zoom: 11.2, duration: 500 });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    filteredMarkers.forEach((marker) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        marker.kind === "property" ? "map-marker map-marker-property" : "map-marker map-marker-spotting";
      element.setAttribute("aria-label", marker.title);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        offset: 22,
      }).setHTML(
        `
          <div class="map-popup">
            <div class="map-popup-kicker">${marker.kind === "property" ? "Bien" : "Repérage"}</div>
            <div class="map-popup-title">${escapeHtml(marker.title)}</div>
            <div class="map-popup-subtitle">${escapeHtml(marker.subtitle)}</div>
            <a class="map-popup-link" href="${marker.href}">Ouvrir la fiche</a>
          </div>
        `,
      );

      const mapboxMarker = new mapboxgl.Marker({ element })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);

      markerRefs.current.push(mapboxMarker);
      bounds.extend([marker.longitude, marker.latitude]);
    });

    if (filteredMarkers.length === 1) {
      map.easeTo({
        center: [filteredMarkers[0].longitude, filteredMarkers[0].latitude],
        zoom: 14,
        duration: 500,
      });
      return;
    }

    map.fitBounds(bounds, {
      padding: 56,
      maxZoom: 15,
      duration: 600,
    });
  }, [filteredMarkers]);

  if (!token) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[#fbf8f4] p-6">
        <div className="text-sm font-medium text-[#3f3a34]">Mapbox non configuré</div>
        <p className="mt-2 text-sm leading-6 text-[#6b665f]">
          Renseigne <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> dans ton environnement pour activer la carte
          interactive réelle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "Tout" },
          { key: "property", label: "Biens" },
          { key: "spotting", label: "Repérages" },
        ].map((item) => {
          const isActive = kindFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setKindFilter(item.key as typeof kindFilter)}
              className={isActive ? "choice-pill choice-pill-active" : "choice-pill"}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-soft">
        <div ref={containerRef} className="h-[520px] w-full" />
      </div>
    </div>
  );
}
