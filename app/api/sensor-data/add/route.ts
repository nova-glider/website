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

import { NextRequest, NextResponse } from "next/server";
import {
  initializeDb,
  addSensorData,
  getCorsHeaders,
  SensorData,
} from "@/lib/sensor-data";

/**
 * POST /api/sensor-data/add
 * Handles incoming sensor data submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin || undefined);

    await initializeDb();

    const body = await request.json();
    const { timestamp } = body as { timestamp?: string };

    // Validate timestamp
    if (!timestamp || typeof timestamp !== "string") {
      return NextResponse.json(
        { error: "Timestamp is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate that body is a valid SensorData object
    const sensorData: SensorData = body as SensorData;

    // Add sensor data (updates memory and saves to disk)
    await addSensorData(sensorData);

    return NextResponse.json(
      { message: "Sensor data saved successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in POST /api/sensor-data/add:", error);

    return NextResponse.json(
      { error: "Error saving sensor data" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/sensor-data/add
 * Handles CORS preflight requests
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin || undefined);

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
