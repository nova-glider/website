"use client";

import { Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const demo_data = [
  {
    timestamp: "2025-06-05T14:23:45Z",
    altitude: 200,
  },
  {
    timestamp: "2025-06-05T14:24:30Z",
    altitude: 60,
  },
  {
    timestamp: "2025-06-05T14:25:56Z",
    altitude: 85,
  },
  {
    timestamp: "2025-06-05T14:27:22Z",
    altitude: 100,
  },
  
];

const readTimeStamp = (timestamp: string | number | Date) => {
  // convert time stamp to local time
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const chartConfig = {
  altitude: {
    label: "Altitude",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export default function Live() {
  return (
    <div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Alert className="max-w-md">
          <Info />
          <AlertTitle>This is a demo.</AlertTitle>
          <AlertDescription>
            All information shown is using placeholder data and does not reflect real-time data.
          </AlertDescription>
        </Alert>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex flex-row items-center justify-center min-h-screen max-w-md mx-auto">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Altitude</CardTitle>
            <CardDescription>
              The height of the cansat over time.
            </CardDescription>
            <CardAction>
              <Button>Refresh</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} >
              <AreaChart
                accessibilityLayer
                data={demo_data}
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
                  tickFormatter={(value) => readTimeStamp(value) }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
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
          </CardContent>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}
