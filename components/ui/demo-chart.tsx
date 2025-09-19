"use client"

import { Bar, BarChart } from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartData = [
  {
    timestamp: "2025-06-05T14:23:45Z",
    altitude: 100,
  },
  {
    timestamp: "2025-06-05T14:24:30Z",
    altitude: 85,
  },
  {
    timestamp: "2025-06-05T14:25:56Z",
    altitude: 60,
    },
];

const chartConfig = {
  altitude: {
    label: "Altitude",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function Component() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <Bar dataKey="altitude" fill="var(--color-altitude)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
