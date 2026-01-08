"use server";

import { initializeDb, getHistory } from "@/lib/sensor-data";

export async function getLatestData() {
  await initializeDb();
  const data = await getHistory();
  const first4DataPoints = Array.isArray(data) ? data.slice(0, 4) : [];
  
  const dataToShow = first4DataPoints.map((point) => ({
    timestamp: point.timestamp,
    altitude: point.location.altitude,
    temperature: point.readings.temperature_celsius,
  }));

  dataToShow.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return dataToShow;
}
