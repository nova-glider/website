import { clsx, type ClassValue } from "clsx";
import { time } from "console";
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
  // fetch latest data from api without cache
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sensor-data/get`, {
    cache: "no-store"
  });
  const data = await res.json();
  console.log(res);
  console.log("Fetched latest data:", data);

  return [{
    timestamp: data.timestamp,
    altitude: data.location.altitude,
    temperature: data.readings.temperature_celsius,
  }];
}

// Helper function to pause execution for a given time in ms
function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
