"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Stats {
  totalRecords: number;
  totalFileCount: number;
  dataVolumeMB: number;
  lastSyncTime: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export default function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Failed to fetch statistics");
      }
    } catch (error) {
      toast.error("Error fetching statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Statistics</h2>
          <p className="text-muted-foreground">Overview of sensor data storage and system health</p>
        </div>
        <Button onClick={fetchStats} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">sensor readings stored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalFileCount}</div>
              <p className="text-xs text-muted-foreground mt-2">JSON files in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dataVolumeMB.toFixed(2)} MB</div>
              <p className="text-xs text-muted-foreground mt-2">disk space used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stats.lastSyncTime}</div>
              <p className="text-xs text-muted-foreground mt-2">most recent data update</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Date Range Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stats.dateRangeStart}</div>
              <p className="text-xs text-muted-foreground mt-2">oldest record</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Date Range End</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stats.dateRangeEnd}</div>
              <p className="text-xs text-muted-foreground mt-2">newest record</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
