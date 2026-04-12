import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import ErrorComponent from "@/components/ui/error-component";
import { readTimeStamp } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description: string;
  dataKey: string;
  chartConfig: ChartConfig;
  loading: boolean;
  latestData: Array<{ timestamp: string | number; [key: string]: unknown }>;
}

export function ChartCard({
  title,
  description,
  dataKey,
  chartConfig,
  loading,
  latestData,
}: ChartCardProps) {
  return (
    <Card className="max-w-sm m-4 aspect-[4/3]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full aspect-video h-44 mb-3" />
        ) : latestData && latestData.length > 0 ? (
          <ChartContainer
            className="w-full aspect-video h-44 mb-3"
            config={chartConfig}
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
                interval={Math.ceil(latestData.length / 5) - 1}
                tickFormatter={(value) => readTimeStamp(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel hideIndicator />}
              />
              <Area
                dataKey={dataKey}
                type="natural"
                fill={`var(--color-${dataKey})`}
                fillOpacity={0.4}
                stroke={`var(--color-${dataKey})`}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <ErrorComponent className="w-full aspect-video h-44 mb-3" />
        )}
      </CardContent>
      {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
    </Card>
  );
}
