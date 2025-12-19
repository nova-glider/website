"use server";

export async function getLatestData() {
  const res = await fetch(`${process.env.API_URL}/sensor-data/get/all`, {
    cache: "no-store",
  });
  const data = await res.json();
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
