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

"use client";

import React, { useEffect, useState } from "react";

import { Info } from "lucide-react";
import { readTimeStamp } from "@/lib/utils";
import { getLatestData } from "@/lib/actions";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChartCard } from "@/components/ui/chart-card";
import { ChartConfig } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const chartConfigAltitude = {
  altitude: {
    label: "Altitude",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const chartConfigTemperature = {
  temperature: {
    label: "Temperature",
    color: "#f97316",
  },
} satisfies ChartConfig;

const chartConfigHumidity = {
  humidity: {
    label: "Humidity",
    color: "#22dd22",
  },
} satisfies ChartConfig;

const chartConfigCO2 = {
  co2_ppm: {
    label: "CO2 PPM",
    color: "#8053ea",
  },
} satisfies ChartConfig;

const chartConfigAirPressure = {
  air_pressure: {
    label: "Air Pressure",
    color: "#e0ea53",
  },
} satisfies ChartConfig;

const chartConfigAirQualityIndex = {
  air_quality_index: {
    label: "Air Quality Index",
    color: "#53eaa8",
  },
} satisfies ChartConfig;  

export default function Live() {
  type SensorData = {
    timestamp: string | number;
    [key: string]: unknown;
  };
  const [latestData, setLatestData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setButtonLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());

  const latestDataHandler = async () => {
    try {
      const data = await getLatestData();
      setLatestData([...data]);
      setLoading(false);
      setButtonLoading(false);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error("Failed to fetch latest data:", error);
      setLoading(false);
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    latestDataHandler();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      latestDataHandler();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center">
        <AlertDialog defaultOpen={true}>
          {/* <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger> */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Warning</AlertDialogTitle>
              <AlertDialogDescription>
                The NovaGlider dashboard is under heavy development and might
                not work as expected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
              <AlertDialogAction>I Understand</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Alert className="max-w-md shadow-md">
          <Info />
          {/* <AlertTitle>This is a demo.</AlertTitle> */}
          <AlertDescription>
            All information shown is using demo data and does not reflect real
            conditions.
          </AlertDescription>
        </Alert>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center mx-auto min-h-screen">
        <div className="flex flex-wrap items-center justify-center">
          <ChartCard
            title="Altitude"
            description="The height in metres."
            dataKey="altitude"
            chartConfig={chartConfigAltitude}
            loading={loading}
            latestData={latestData}
          />
          <ChartCard
            title="Temperature"
            description="The temperature in degrees Celcius."
            dataKey="temperature"
            chartConfig={chartConfigTemperature}
            loading={loading}
            latestData={latestData}
          />
          <ChartCard
            title="Humidity"
            description="The humidity in percent."
            dataKey="humidity"
            chartConfig={chartConfigHumidity}
            loading={loading}
            latestData={latestData}
          />
          <ChartCard
            title="CO2"
            description="The carbon dioxide in ppm."
            dataKey="co2_ppm"
            chartConfig={chartConfigCO2}
            loading={loading}
            latestData={latestData}
          />
          <ChartCard
            title="Air Pressure"
            description="The air pressure in hPa."
            dataKey="air_pressure"
            chartConfig={chartConfigAirPressure}
            loading={loading}
            latestData={latestData}
          />
          <ChartCard
            title="Air Quality Index"
            description="The AQI on a scale of 1-100."
            dataKey="air_quality_index"
            chartConfig={chartConfigAirQualityIndex}
            loading={loading}
            latestData={latestData}
          />
        </div>
        <div className="flex justify-center mb-4">
          <p className="text-muted-foreground">
            Last checked:{" "}
            {Math.floor((currentTime + 1000 - lastFetchTime) / 1000)}s ago
          </p>
        </div>
      </div>
    </div>
  );
}
