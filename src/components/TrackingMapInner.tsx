"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

export type MapPoint = { lat: number; lng: number; nama: string };

export default function TrackingMapInner({ visited, tujuan }: { visited: MapPoint[]; tujuan: MapPoint | null }) {
  const route: LatLngTuple[] = visited.map((p) => [p.lat, p.lng]);
  const all: LatLngTuple[] = tujuan ? [...route, [tujuan.lat, tujuan.lng]] : route;
  if (!all.length) return null;
  const last = visited[visited.length - 1];
  const sentuh = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <MapContainer
      {...(all.length > 1 ? { bounds: all, boundsOptions: { padding: [32, 32] as [number, number] } } : { center: all[0], zoom: 9 })}
      scrollWheelZoom={false}
      dragging={!sentuh}
      className="h-72 w-full rounded-xl md:h-96"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#dc2626", weight: 4 }} />}
      {last && tujuan && (
        <Polyline
          positions={[[last.lat, last.lng], [tujuan.lat, tujuan.lng]]}
          pathOptions={{ color: "#64748b", weight: 3, dashArray: "6 8" }}
        />
      )}
      {visited.map((p, i) => (
        <CircleMarker
          key={`${p.nama}-${i}`}
          center={[p.lat, p.lng]}
          radius={i === visited.length - 1 ? 10 : 6}
          pathOptions={{ color: "#fff", weight: 2, fillColor: i === visited.length - 1 ? "#dc2626" : "#f87171", fillOpacity: 1 }}
        >
          <Tooltip>{i === visited.length - 1 ? `Posisi terakhir: ${p.nama}` : p.nama}</Tooltip>
        </CircleMarker>
      ))}
      {tujuan && (
        <CircleMarker
          center={[tujuan.lat, tujuan.lng]}
          radius={9}
          pathOptions={{ color: "#fff", weight: 2, fillColor: "#059669", fillOpacity: 1 }}
        >
          <Tooltip>Tujuan: {tujuan.nama}</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
