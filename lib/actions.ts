/*
 * This file is part of the NovaGlider project.
 *
 * Copyright (C) 2025 NovaGlider, Wannes Ghysels
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

"use server";

import { initializeDb, getHistory } from "@/lib/sensor-data";

export async function getLatestData() {
  await initializeDb();
  const data = await getHistory();
  // const first4DataPoints = Array.isArray(data) ? data.slice(0, 4) : [];
  
  const dataToShow = data.map((point) => ({
    timestamp: point.timestamp,
    altitude: point.location.altitude,
    temperature: point.readings.temperature_celsius,
  }));

  dataToShow.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return dataToShow;
}
