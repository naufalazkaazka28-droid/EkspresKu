"use client";

import { useEffect, useRef } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapPoint = { lat: number; lng: number; nama: string };

export default function TrackingMapInner({ visited, tujuan }: { visited: MapPoint[]; tujuan: MapPoint | null }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const route = visited.map((p) => [p.lng, p.lat]);
    const all = tujuan ? [...visited, tujuan] : visited;
    if (!all.length) return;

    const map: MapLibreMap = new MapLibreMap({
      container: container.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [all[0].lng, all[0].lat],
      zoom: 9,
      attributionControl: false,
    });
    const markers: Marker[] = [];

    map.addControl(new NavigationControl({ showCompass: false }), "top-left");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: [
          '<a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a>',
          '<a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a>',
          '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
        ],
      }),
      "bottom-right",
    );
    map.scrollZoom.disable();
    if (window.matchMedia("(pointer: coarse)").matches) map.dragPan.disable();

    if (all.length > 1) {
      const lngs = all.map((p) => p.lng);
      const lats = all.map((p) => p.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 32, maxZoom: 9 },
      );
    }

    map.on("load", () => {
      if (route.length > 1) {
        map.addSource("visited-route", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } },
        });
        map.addLayer({
          id: "visited-route",
          type: "line",
          source: "visited-route",
          paint: { "line-color": "#dc2626", "line-width": 4 },
        });
      }

      const last = visited[visited.length - 1];
      if (last && tujuan) {
        map.addSource("destination-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [[last.lng, last.lat], [tujuan.lng, tujuan.lat]] },
          },
        });
        map.addLayer({
          id: "destination-route",
          type: "line",
          source: "destination-route",
          paint: { "line-color": "#64748b", "line-width": 3, "line-dasharray": [2, 2] },
        });
      }

      visited.forEach((point, index) => {
        const latest = index === visited.length - 1;
        markers.push(
          new Marker({ color: latest ? "#dc2626" : "#f87171" })
            .setLngLat([point.lng, point.lat])
            .setPopup(new Popup({ offset: 25 }).setText(latest ? `Posisi terakhir: ${point.nama}` : point.nama))
            .addTo(map),
        );
      });

      if (tujuan) {
        markers.push(
          new Marker({ color: "#059669" })
            .setLngLat([tujuan.lng, tujuan.lat])
            .setPopup(new Popup({ offset: 25 }).setText(`Tujuan: ${tujuan.nama}`))
            .addTo(map),
        );
      }
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [visited, tujuan]);

  if (!visited.length && !tujuan) return null;

  return <div ref={container} className="h-72 w-full rounded-xl md:h-96" />;
}
