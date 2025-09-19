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
  // fetch latest data from api
  // const response = await fetch(`${API_URL}/sensor-data/get`);
  // if (!response.ok) {
  //   throw new Error("Failed to fetch latest data");
  // }
  // return response.json();

  await pause(1000);
  const now = new Date();
  const intervalMs = 20 * 60 * 1000; // 20 minutes in milliseconds
  let altitude = 100 + Math.floor(Math.random() * 11) - 5; // start around 100 (+-5)
  return Array.from({ length: 4 }).map((_, i) => {
    if (i > 0) {
      altitude -= Math.floor(Math.random() * 16) + 10; // decrease by 10-25
    }
    return {
      timestamp: new Date(now.getTime() + i * intervalMs).toISOString(),
      altitude: altitude,
      temperature: 20 + Math.floor(Math.random() * 11) - 5, // start around 20 (+-5)
    };
  });
}

// Helper function to pause execution for a given time in ms
function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
