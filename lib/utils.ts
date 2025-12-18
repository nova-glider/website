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

// Helper function to pause execution for a given time in ms
function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
