'use server';

export async function getLatestData() {

  const res = await fetch(`${process.env.API_URL}/sensor-data/get/all`, {
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