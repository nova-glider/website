import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// const API_URL = process.env.API_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function readTimeStamp(timestamp: string | number | Date) {
  // convert time stamp to local time
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function getLatestData() {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sensor-data/get/all`, {
    cache: "no-store"
  });
  const data = await res.json();
  const first4DataPoints = Array.isArray(data) ? data.slice(0, 4) : [];
  const dataToShow = [];

  for (let i = 0; i < first4DataPoints.length; i++) {
    // add each data points timestamp, location.altitude, readings.temperature_celsius to dataToShow
    dataToShow.push({
      timestamp: first4DataPoints[i].timestamp,
      altitude: first4DataPoints[i].location.altitude,
      temperature: first4DataPoints[i].readings.temperature_celsius
    });
  }

  return dataToShow;
}

// Helper function to pause execution for a given time in ms
function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
