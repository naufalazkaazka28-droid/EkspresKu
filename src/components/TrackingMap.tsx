"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./TrackingMapInner";

// Leaflet butuh `window`, jadi hanya dimuat di sisi klien.
const Inner = dynamic(() => import("./TrackingMapInner"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-slate-100 md:h-96" />,
});

export default function TrackingMap(props: { visited: MapPoint[]; tujuan: MapPoint | null }) {
  return <Inner {...props} />;
}
