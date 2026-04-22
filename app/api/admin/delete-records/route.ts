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
import { deleteRecordsByIds, deleteRecordsByDateRange, deleteAllRecords } from "@/lib/sensor-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, recordIds, startDate, endDate, password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    let deletedCount = 0;

    if (mode === "individual" && recordIds && Array.isArray(recordIds)) {
      deletedCount = await deleteRecordsByIds(recordIds);
    } else if (mode === "dateRange" && startDate && endDate) {
      deletedCount = await deleteRecordsByDateRange(startDate, endDate);
    } else if (mode === "all") {
      deletedCount = await deleteAllRecords();
    } else {
      return NextResponse.json(
        { error: "Invalid delete mode or parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} records`,
    });
  } catch (error) {
    console.error("Error deleting records:", error);
    return NextResponse.json(
      { error: "Failed to delete records" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
