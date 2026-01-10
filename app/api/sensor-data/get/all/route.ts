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
import { initializeDb, getHistory, getCorsHeaders } from "@/lib/sensor-data";

/**
 * GET /api/sensor-data/get/all
 * Returns all sensor data history (newest first)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin || undefined);

    await initializeDb();

    const history = await getHistory();

    if (history.length === 0) {
      return NextResponse.json(
        { error: "No sensor data available." },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(history, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error in GET /api/sensor-data/get/all:", error);

    return NextResponse.json(
      { error: "Error reading sensor data" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/sensor-data/get/all
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
