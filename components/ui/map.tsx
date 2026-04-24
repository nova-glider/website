"use client"

import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
// @ts-expect-error -- package CSS file has no type declarations
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
// @ts-expect-error -- package CSS file has no type declarations
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import { getLatestData } from "@/lib/actions";

type MapProps = {
  position?: [number, number]
  zoom?: number
  style?: "cartoLight" | "cartoDark" | "esriWorldImagery" | "osmStandard"
}

const TILE_STYLES = {
  cartoLight: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  },
  cartoDark: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  },
  esriWorldImagery: {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  osmStandard: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
} as const

export function Map({
  position,
  zoom = 17,
  style = "esriWorldImagery",
}: MapProps) {
  const [mapPosition, setMapPosition] = useState<[number, number]>(position ?? [0, 0]);
  const [isLoading, setIsLoading] = useState(!position);

  useEffect(() => {
    if (position) return; // Use provided position if given

    const fetchLatestData = async () => {
      try {
        const [latestData] = await getLatestData();
        if (latestData?.latitude && latestData?.longitude) {
          setMapPosition([latestData.latitude, latestData.longitude]);
        }
      } catch (error) {
        console.error("Failed to fetch latest data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);

    return () => clearInterval(interval);
  }, [position]);

  const tileStyle = TILE_STYLES[style]

  if (isLoading) {
    return <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map...</div>
  }

  return <MapContainer center={mapPosition} zoom={zoom} scrollWheelZoom={false} style={{ height: "100vh", width: "100%" }} >
    <TileLayer
      attribution={tileStyle.attribution}
      url={tileStyle.url}
    />
    <Marker position={mapPosition}>
      <Popup>
        The glider is currently located here. <br />
        (Latitude: {mapPosition[0]}, Longitude: {mapPosition[1]})
      </Popup>
    </Marker>
  </MapContainer>
}