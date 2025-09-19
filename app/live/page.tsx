"use client";

import React, { useEffect, useState } from "react";

import { Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { readTimeStamp, getLatestData } from "@/lib/utils";

import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function Live() {
  type AltitudeData = {
    timestamp: string | number;
    altitude: number;
    [key: string]: unknown;
  };
  const [latestData, setLatestData] = useState<AltitudeData[]>([]);

  useEffect(() => {
    getLatestData()
      .then(setLatestData)
      .catch((error) => {
        console.error("Failed to fetch latest data:", error);
      });
  }, []);

  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Alert className="max-w-md">
          <Info />
          <AlertTitle>This is a demo.</AlertTitle>
          <AlertDescription>
            All information shown is using placeholder data and does not reflect
            real-time data.
          </AlertDescription>
        </Alert>
      </div>

      <div className="fixed bottom-25 left-1/2 -translate-x-1/2 z-50 flex justify-center">
        <Button
          onClick={() => {
        setLoading(true);
        getLatestData()
          .then(setLatestData)
          .catch((error) => {
            console.error("Failed to fetch latest data:", error);
          })
          .finally(() => {
            setLoading(false);
          });
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center min-h-screen max-w-md mx-auto">
        <Card className="w-full max-w-sm m-4 aspect-[4/3] sm:mb-20">
          <CardHeader>
            <CardTitle>Altitude</CardTitle>
            <CardDescription>
              The height of the cansat over time.
            </CardDescription>
            <CardAction>
              
            </CardAction>
          </CardHeader>
          <CardContent>
            {latestData && latestData.length > 0 ? (
              <ChartContainer
                className="aspect-video h-45"
                config={chartConfigAltitude}
              >
                <AreaChart
                  accessibilityLayer
                  data={latestData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                  className="p-2"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tickFormatter={(value) => readTimeStamp(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel hideIndicator />}
                  />
                  <Area
                    dataKey="altitude"
                    type="natural"
                    fill="var(--color-altitude)"
                    fillOpacity={0.4}
                    stroke="var(--color-altitude)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <Skeleton className="w-full aspect-video h-44 mb-3" />
            )}
          </CardContent>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>

        <Card className="w-full max-w-sm m-4 aspect-[4/3] sm:mb-20">
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
            <CardDescription>The temperature over time.</CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent>
            {latestData && latestData.length > 0 ? (
              <ChartContainer
                className="aspect-video h-45"
                config={chartConfigTemperature}
              >
                <AreaChart
                  accessibilityLayer
                  data={latestData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                  className="p-2"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tickFormatter={(value) => readTimeStamp(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel hideIndicator />}
                  />
                  <Area
                    dataKey="temperature"
                    type="natural"
                    fill="var(--color-temperature)"
                    fillOpacity={0.4}
                    stroke="var(--color-temperature)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <Skeleton className="w-full aspect-video h-44 mb-3" />
            )}
          </CardContent>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}
