import fs from "fs/promises";
import path from "path";

export interface SensorData {
  timestamp: string;
  location: {
    altitude: number;
  };
  readings: {
    temperature_celsius: number;
  };
  [key: string]: unknown;
}

const DB_DIR = path.join(process.cwd(), "db");

// In-memory cache
let latestData: SensorData | null = null;
let sensorDataHistory: SensorData[] = [];
let isHistoryLoaded = false;
let lastSyncedFileName: string | null = null;

/**
 * Ensure the database directory exists
 */
export async function initializeDb(): Promise<void> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating db directory:", error);
    throw error;
  }
}

/**
 * Clean timestamp to use as filename (e.g., "20250605142345" from "2025-06-05T14:23:45Z")
 */
export function cleanTimestamp(timestamp: string): string {
  return timestamp.replace(/[-:T]/g, "").slice(0, 14);
}

/**
 * Save sensor data to file
 */
export async function saveToFile(
  filename: string,
  data: SensorData
): Promise<void> {
  try {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving sensor data:", error);
    throw error;
  }
}

/**
 * Read sensor data from file
 */
export async function readFromFile(filename: string): Promise<SensorData> {
  try {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as SensorData;
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    throw error;
  }
}

/**
 * List all sensor data files, sorted by timestamp (newest first)
 */
export async function listSensorFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(DB_DIR);
    const sensorFiles = files.filter((f) => /^sensor-data-\d+\.json$/.test(f));

    // Sort by timestamp in filename (descending)
    sensorFiles.sort((a, b) => {
      const timeA = a.match(/sensor-data-(\d+)\.json/)?.[1] || "";
      const timeB = b.match(/sensor-data-(\d+)\.json/)?.[1] || "";
      return timeB.localeCompare(timeA);
    });

    return sensorFiles;
  } catch (error) {
    console.error("Error listing sensor files:", error);
    return [];
  }
}

/**
 * Load all sensor data from disk into memory
 */
export async function loadHistoryFromDisk(): Promise<SensorData[]> {
  try {
    const files = await listSensorFiles();

    if (files.length === 0) {
      sensorDataHistory = [];
      isHistoryLoaded = true;
      return [];
    }

    // If this is the first load, load all files
    if (!isHistoryLoaded || lastSyncedFileName === null) {
      const loadedData = await Promise.all(
        files.map(async (file) => {
          try {
            const data = await fs.readFile(path.join(DB_DIR, file), "utf-8");
            return JSON.parse(data) as SensorData;
          } catch (parseError) {
            console.error(`Error parsing file ${file}:`, parseError);
            return null;
          }
        })
      );

      sensorDataHistory = loadedData.filter(
        (item) => item !== null
      ) as SensorData[];
      isHistoryLoaded = true;
      
      // Set lastSyncedFileName to the newest file
      if (files.length > 0) {
        lastSyncedFileName = files[0];
      }

      return sensorDataHistory;
    }

    // Incremental load: only load files newer than lastSyncedFileName
    const lastSyncedIndex = files.indexOf(lastSyncedFileName);
    const newFiles = lastSyncedIndex === -1 ? files : files.slice(0, lastSyncedIndex);

    if (newFiles.length === 0) {
      // No new files
      return sensorDataHistory;
    }

    const newData = await Promise.all(
      newFiles.map(async (file) => {
        try {
          const data = await fs.readFile(path.join(DB_DIR, file), "utf-8");
          return JSON.parse(data) as SensorData;
        } catch (parseError) {
          console.error(`Error parsing file ${file}:`, parseError);
          return null;
        }
      })
    );

    const validNewData = newData.filter(
      (item) => item !== null
    ) as SensorData[];

    // Prepend new data to history (files are sorted newest first)
    sensorDataHistory = [...validNewData, ...sensorDataHistory];
    
    // Update lastSyncedFileName to the newest file
    if (newFiles.length > 0) {
      lastSyncedFileName = newFiles[0];
    }

    return sensorDataHistory;
  } catch (error) {
    console.error("Error loading history from disk:", error);
    return [];
  }
}

/**
 * Load the latest sensor data from disk
 */
export async function loadLatestFromDisk(): Promise<SensorData | null> {
  try {
    const files = await listSensorFiles();

    if (files.length === 0) {
      latestData = null;
      return null;
    }

    const data = await fs.readFile(path.join(DB_DIR, files[0]), "utf-8");
    latestData = JSON.parse(data) as SensorData;
    return latestData;
  } catch (error) {
    console.error("Error loading latest from disk:", error);
    return null;
  }
}

/**
 * Get the latest sensor data (from memory or disk)
 */
export async function getLatest(): Promise<SensorData | null> {
  if (latestData !== null) {
    return latestData;
  }
  return loadLatestFromDisk();
}

/**
 * Get all sensor data history (from memory or disk)
 */
export async function getHistory(): Promise<SensorData[]> {
  if (!isHistoryLoaded) {
    return loadHistoryFromDisk();
  }
  // Always check for new files on subsequent calls
  return loadHistoryFromDisk();
}

/**
 * Add new sensor data (update memory and save to disk)
 */
export async function addSensorData(data: SensorData): Promise<void> {
  // Update in-memory cache
  latestData = data;
  sensorDataHistory.unshift(data);

  // Update the lastSyncedFileName to track this new data
  const timestampCleaned = cleanTimestamp(data.timestamp);
  lastSyncedFileName = `sensor-data-${timestampCleaned}.json`;

  // Save to disk
  await saveToFile(`sensor-data-${timestampCleaned}`, data);
}

/**
 * Get CORS headers based on allowed origins
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(",").map((o) => o.trim())
    : ["http://localhost:3000"];

  let corsOrigin = allowedOrigins[0];

  if (origin) {
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      corsOrigin = origin;
    }
  }

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
