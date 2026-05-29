"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export type CityName =
  | "Tokyo"
  | "Osaka"
  | "Singapore"
  | "Dubai"
  | "Los Angeles"
  | "Seoul"
  | "Berlin"
  | "Toronto";

type CityMapProps = {
  city: CityName;
};

type CityConfig = {
  center: [number, number];
  zoom: number;
};

type CoverageRegion = {
  count: number;
  east: number;
  name: string;
  north: number;
  south: number;
  west: number;
};

type StationMarker = {
  hubLabel?: number;
  id: number;
  position: [number, number];
};

const cityConfig: Record<CityName, CityConfig> = {
  Tokyo: { center: [35.6762, 139.6503], zoom: 10 },
  Osaka: { center: [34.6937, 135.5023], zoom: 11 },
  Singapore: { center: [1.3521, 103.8198], zoom: 11 },
  Dubai: { center: [25.2048, 55.2708], zoom: 10 },
  "Los Angeles": { center: [34.0522, -118.2437], zoom: 10 },
  Seoul: { center: [37.5665, 126.978], zoom: 10 },
  Berlin: { center: [52.52, 13.405], zoom: 11 },
  Toronto: { center: [43.6532, -79.3832], zoom: 10 },
};

const coverageRegions: Record<CityName, CoverageRegion[]> = {
  Tokyo: [
    region("Tachikawa", 35.67, 35.73, 139.36, 139.46, 7),
    region("Kichijoji", 35.68, 35.74, 139.54, 139.62, 6),
    region("Nerima", 35.72, 35.79, 139.58, 139.68, 7),
    region("Itabashi", 35.73, 35.8, 139.67, 139.76, 7),
    region("Ikebukuro", 35.7, 35.75, 139.68, 139.75, 6),
    region("Ueno Asakusa", 35.69, 35.74, 139.76, 139.83, 7),
    region("Koto Edogawa", 35.65, 35.72, 139.79, 139.88, 8),
    region("Chiyoda Ginza", 35.65, 35.7, 139.73, 139.78, 5),
    region("Shinjuku", 35.67, 35.71, 139.66, 139.72, 5),
    region("Shibuya Minato", 35.62, 35.68, 139.67, 139.76, 7),
    region("Setagaya", 35.6, 35.68, 139.58, 139.68, 8),
    region("Meguro Shinagawa", 35.58, 35.64, 139.67, 139.76, 7),
    region("Ota", 35.53, 35.6, 139.66, 139.75, 7),
    region("Kawasaki", 35.49, 35.56, 139.61, 139.72, 8),
    region("Yokohama Edge", 35.42, 35.49, 139.57, 139.68, 8),
    region("Saitama South", 35.79, 35.86, 139.62, 139.78, 8),
  ],
  Osaka: [
    region("Umeda", 34.69, 34.73, 135.48, 135.53, 5),
    region("Namba", 34.65, 34.69, 135.48, 135.54, 5),
    region("Tennoji", 34.62, 34.66, 135.49, 135.55, 5),
    region("Shin Osaka", 34.72, 34.76, 135.47, 135.54, 5),
    region("Toyonaka", 34.76, 34.82, 135.43, 135.51, 6),
    region("Suita", 34.75, 34.82, 135.51, 135.59, 6),
    region("Higashiosaka", 34.64, 34.72, 135.55, 135.65, 8),
    region("Sakai", 34.53, 34.6, 135.44, 135.54, 8),
    region("Moriguchi Kadoma", 34.71, 34.77, 135.56, 135.64, 6),
    region("Ibaraki", 34.8, 34.86, 135.54, 135.62, 6),
    region("Yao", 34.58, 34.65, 135.56, 135.64, 6),
    region("Suminoe", 34.59, 34.65, 135.42, 135.49, 5),
    region("Amagasaki", 34.7, 34.77, 135.38, 135.46, 6),
    region("Neyagawa", 34.74, 34.8, 135.6, 135.68, 6),
    region("Matsubara", 34.55, 34.62, 135.51, 135.59, 6),
  ],
  Singapore: [
    region("Woodlands", 1.42, 1.46, 103.76, 103.82, 5),
    region("Yishun", 1.4, 1.44, 103.81, 103.87, 5),
    region("Sengkang", 1.38, 1.42, 103.87, 103.92, 5),
    region("Pasir Ris", 1.35, 1.39, 103.93, 104.0, 6),
    region("Tampines", 1.33, 1.37, 103.91, 103.97, 6),
    region("Changi Business Park", 1.32, 1.36, 103.95, 104.0, 5),
    region("Bedok", 1.31, 1.34, 103.91, 103.95, 5),
    region("Paya Lebar", 1.31, 1.35, 103.87, 103.91, 5),
    region("Bishan Toa Payoh", 1.33, 1.37, 103.83, 103.87, 6),
    region("Orchard", 1.29, 1.32, 103.82, 103.85, 4),
    region("CBD Marina", 1.275, 1.305, 103.84, 103.87, 4),
    region("Bukit Timah", 1.32, 1.36, 103.76, 103.82, 6),
    region("Jurong East", 1.31, 1.35, 103.72, 103.77, 6),
    region("Choa Chu Kang", 1.37, 1.41, 103.73, 103.78, 5),
    region("Clementi", 1.3, 1.33, 103.75, 103.79, 5),
    region("Queenstown", 1.28, 1.31, 103.78, 103.82, 4),
    region("HarbourFront", 1.26, 1.285, 103.8, 103.84, 3),
    region("Serangoon", 1.34, 1.38, 103.86, 103.9, 5),
  ],
  Dubai: [
    region("Downtown Dubai", 25.18, 25.21, 55.25, 55.3, 5),
    region("Business Bay", 25.17, 25.2, 55.25, 55.31, 5),
    region("Deira", 25.25, 25.3, 55.29, 55.36, 6),
    region("Bur Dubai", 25.22, 25.26, 55.27, 55.33, 5),
    region("Jumeirah", 25.17, 25.24, 55.2, 55.27, 6),
    region("Dubai Marina", 25.07, 25.1, 55.13, 55.16, 4),
    region("JLT", 25.06, 25.09, 55.15, 55.18, 4),
    region("Internet City", 25.09, 25.12, 55.16, 55.19, 4),
    region("Media City", 25.09, 25.12, 55.14, 55.17, 4),
    region("Al Barsha", 25.09, 25.14, 55.19, 55.25, 6),
    region("Dubai Hills", 25.09, 25.14, 55.24, 55.31, 6),
    region("Silicon Oasis", 25.1, 25.15, 55.36, 55.43, 6),
    region("Mirdif", 25.22, 25.27, 55.39, 55.45, 6),
    region("Festival City", 25.2, 25.24, 55.34, 55.39, 5),
    region("Airport Area", 25.23, 25.28, 55.36, 55.42, 6),
    region("Jebel Ali Land", 24.98, 25.06, 55.08, 55.18, 8),
    region("Expo City", 24.94, 25.0, 55.13, 55.22, 7),
    region("Sharjah Edge", 25.29, 25.34, 55.39, 55.48, 7),
    region("Nad Al Sheba", 25.14, 25.19, 55.31, 55.38, 6),
    region("Dubai South", 24.9, 24.97, 55.18, 55.28, 7),
  ],
  "Los Angeles": [
    region("Downtown", 34.02, 34.07, -118.27, -118.2, 6),
    region("Hollywood", 34.08, 34.13, -118.36, -118.29, 6),
    region("Santa Monica", 34.0, 34.05, -118.5, -118.42, 6),
    region("Culver City", 33.98, 34.04, -118.42, -118.35, 6),
    region("LAX", 33.92, 33.97, -118.44, -118.35, 6),
    region("Inglewood", 33.94, 34.0, -118.36, -118.28, 6),
    region("Long Beach", 33.77, 33.85, -118.24, -118.14, 8),
    region("Torrance", 33.8, 33.88, -118.36, -118.26, 8),
    region("Pasadena", 34.12, 34.2, -118.2, -118.08, 8),
    region("Glendale", 34.13, 34.2, -118.3, -118.2, 7),
    region("Burbank", 34.16, 34.23, -118.37, -118.27, 7),
    region("Van Nuys", 34.17, 34.25, -118.5, -118.4, 8),
    region("West Covina", 34.04, 34.11, -118.0, -117.9, 8),
    region("East LA", 34.0, 34.07, -118.18, -118.08, 8),
    region("South Gate", 33.9, 33.98, -118.24, -118.14, 8),
    region("Whittier", 33.94, 34.02, -118.08, -117.98, 8),
  ],
  Seoul: [
    region("Jongno", 37.56, 37.6, 126.96, 127.02, 5),
    region("Gangnam", 37.48, 37.53, 127.02, 127.08, 6),
    region("Yeouido", 37.51, 37.55, 126.9, 126.95, 5),
    region("Hongdae", 37.54, 37.58, 126.9, 126.96, 5),
    region("Mapo", 37.55, 37.59, 126.86, 126.92, 5),
    region("Guro", 37.47, 37.52, 126.84, 126.9, 6),
    region("Songpa", 37.48, 37.53, 127.09, 127.16, 6),
    region("Gangdong", 37.52, 37.57, 127.12, 127.18, 5),
    region("Nowon", 37.62, 37.68, 127.04, 127.1, 6),
    region("Eunpyeong", 37.59, 37.65, 126.88, 126.95, 6),
    region("Gimpo Airport Edge", 37.54, 37.59, 126.78, 126.84, 6),
    region("Seongnam Edge", 37.42, 37.48, 127.09, 127.17, 7),
    region("Anyang Edge", 37.38, 37.44, 126.9, 126.98, 7),
    region("Guri Edge", 37.58, 37.64, 127.1, 127.17, 6),
    region("Yongsan", 37.51, 37.55, 126.96, 127.02, 5),
    region("Dobong", 37.65, 37.7, 127.0, 127.06, 5),
  ],
  Berlin: [
    region("Mitte", 52.5, 52.54, 13.36, 13.43, 5),
    region("Kreuzberg", 52.47, 52.51, 13.38, 13.45, 5),
    region("Charlottenburg", 52.49, 52.54, 13.25, 13.33, 6),
    region("Spandau", 52.5, 52.56, 13.15, 13.25, 7),
    region("Pankow", 52.55, 52.62, 13.36, 13.48, 8),
    region("Lichtenberg", 52.49, 52.56, 13.48, 13.6, 8),
    region("Marzahn", 52.51, 52.58, 13.55, 13.66, 7),
    region("Neukolln", 52.43, 52.48, 13.4, 13.5, 7),
    region("Tempelhof", 52.43, 52.48, 13.34, 13.43, 6),
    region("Steglitz", 52.42, 52.48, 13.28, 13.36, 6),
    region("Zehlendorf", 52.39, 52.46, 13.2, 13.32, 7),
    region("Tegel", 52.55, 52.61, 13.25, 13.36, 7),
    region("Adlershof", 52.39, 52.45, 13.49, 13.57, 6),
    region("Airport South", 52.35, 52.42, 13.43, 13.55, 7),
    region("Friedrichshain", 52.5, 52.54, 13.42, 13.5, 5),
  ],
  Toronto: [
    region("Downtown", 43.64, 43.68, -79.4, -79.35, 5),
    region("Liberty Village", 43.62, 43.65, -79.43, -79.38, 4),
    region("Etobicoke", 43.61, 43.7, -79.58, -79.48, 8),
    region("North York", 43.72, 43.79, -79.46, -79.35, 8),
    region("Scarborough", 43.72, 43.82, -79.32, -79.18, 10),
    region("York", 43.67, 43.73, -79.5, -79.4, 7),
    region("East York", 43.68, 43.73, -79.34, -79.28, 6),
    region("Mississauga Edge", 43.57, 43.66, -79.68, -79.56, 9),
    region("Pearson Airport", 43.66, 43.72, -79.66, -79.57, 7),
    region("Vaughan Edge", 43.78, 43.86, -79.56, -79.45, 8),
    region("Markham Edge", 43.8, 43.88, -79.38, -79.25, 8),
    region("Pickering Edge", 43.78, 43.86, -79.18, -79.08, 7),
    region("Waterfront East", 43.63, 43.67, -79.35, -79.25, 6),
    region("High Park", 43.64, 43.69, -79.48, -79.42, 6),
    region("Don Mills", 43.7, 43.77, -79.37, -79.3, 7),
  ],
};

export default function CityMap({ city }: CityMapProps) {
  const config = cityConfig[city];
  const markers = useMemo(() => buildCityMarkers(city), [city]);

  return (
    <MapContainer
      center={config.center}
      zoom={config.zoom}
      dragging
      scrollWheelZoom
      doubleClickZoom
      zoomControl
      attributionControl={false}
      className="h-[420px] w-full sm:h-[520px] lg:h-full lg:min-h-[520px]"
    >
      <MapViewSync city={city} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((marker) =>
        marker.hubLabel ? (
          <Marker
            key={`${city}-${marker.id}`}
            position={marker.position}
            icon={createHubIcon(marker.hubLabel)}
          />
        ) : (
          <CircleMarker
            key={`${city}-${marker.id}`}
            center={marker.position}
            radius={3}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#dc2626",
              fillOpacity: 0.6,
              opacity: 0.6,
              weight: 1,
            }}
          />
        ),
      )}
    </MapContainer>
  );
}

function MapViewSync({ city }: { city: CityName }) {
  const map = useMap();
  const config = cityConfig[city];

  useEffect(() => {
    map.setView(config.center, config.zoom, { animate: true });
  }, [city, config.center, config.zoom, map]);

  return null;
}

function buildCityMarkers(city: CityName): StationMarker[] {
  const positions = buildCoordinatePool(coverageRegions[city]);
  const hubIndexes = selectHubIndexes(positions);

  return positions.map((position, index) => ({
    hubLabel: hubIndexes.includes(index) ? hubIndexes.indexOf(index) + 1 : undefined,
    id: index + 1,
    position,
  }));
}

function buildCoordinatePool(regions: CoverageRegion[]) {
  return regions.flatMap((item, regionIndex) =>
    Array.from({ length: item.count }, (_, pointIndex) => {
      const sequence = regionIndex * 37 + pointIndex + 1;
      const latUnit = halton(sequence, 2);
      const lngUnit = halton(sequence + 19, 3);
      const lat = item.south + latUnit * (item.north - item.south);
      const lng = item.west + lngUnit * (item.east - item.west);

      return [roundCoord(lat), roundCoord(lng)] as [number, number];
    }),
  );
}

function selectHubIndexes(points: [number, number][]) {
  if (points.length < 3) {
    return [];
  }

  return [
    Math.floor(points.length * 0.17),
    Math.floor(points.length * 0.51),
    Math.floor(points.length * 0.83),
  ];
}

function region(
  name: string,
  south: number,
  north: number,
  west: number,
  east: number,
  count: number,
): CoverageRegion {
  return { count, east, name, north, south, west };
}

function halton(index: number, base: number) {
  let result = 0;
  let fraction = 1 / base;
  let current = index;

  while (current > 0) {
    result += fraction * (current % base);
    current = Math.floor(current / base);
    fraction /= base;
  }

  return result;
}

function createHubIcon(index: number) {
  const size = 16;

  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:999px;
      background:#dc2626;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:8px;
      font-weight:700;
      border:1px solid white;
      opacity:0.65;
    ">${index}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function roundCoord(value: number) {
  return Number(value.toFixed(6));
}
