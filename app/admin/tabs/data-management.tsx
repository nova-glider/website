"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SensorReading {
  timestamp: string;
  altitude: number;
  temperature_celsius: number;
  humidity_percent?: number;
  air_pressure_hpa?: number;
  co2_ppm?: number;
  air_quality_index?: number;
}

interface RawSensorData {
  timestamp: string;
  location: {
    altitude: number;
  };
  readings: {
    temperature_celsius: number;
    humidity_percent?: number;
    air_pressure_hpa?: number;
    co2_ppm?: number;
    air_quality_index?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function DataManagementTab() {
  const [data, setData] = useState<SensorReading[]>([]);
  const [filteredData, setFilteredData] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"individual" | "dateRange" | "all">("individual");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all sensor data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/sensor-data/get/all");
        if (response.ok) {
          const rawData = await response.json();
          
          // Transform raw data to flattened format
          const transformedData: SensorReading[] = (Array.isArray(rawData) ? rawData : []).map((item: RawSensorData) => ({
            timestamp: item.timestamp,
            altitude: item.location.altitude,
            temperature_celsius: item.readings.temperature_celsius,
            humidity_percent: item.readings.humidity_percent,
            air_pressure_hpa: item.readings.air_pressure_hpa,
            co2_ppm: item.readings.co2_ppm,
            air_quality_index: item.readings.air_quality_index,
          }));
          
          setData(transformedData);
          setFilteredData(transformedData);
        } else {
          toast.error("Failed to fetch sensor data");
        }
      } catch (error) {
        toast.error("Error fetching sensor data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...data];

    if (dateRangeStart) {
      filtered = filtered.filter((r) => new Date(r.timestamp) >= new Date(dateRangeStart));
    }
    if (dateRangeEnd) {
      filtered = filtered.filter((r) => new Date(r.timestamp) <= new Date(dateRangeEnd));
    }

    filtered.sort((a, b) => {
      const aVal = a[sortColumn as keyof SensorReading];
      const bVal = b[sortColumn as keyof SensorReading];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0; 
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredData(filtered);
  }, [data, dateRangeStart, dateRangeEnd, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((r) => r.timestamp)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (timestamp: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(timestamp);
    } else {
      newSelected.delete(timestamp);
    }
    setSelectedRows(newSelected);
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/delete-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "individual",
          recordIds: Array.from(selectedRows),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Deleted ${result.deletedCount} records`);
        setSelectedRows(new Set());
        setData(data.filter((r) => !selectedRows.has(r.timestamp)));
      } else {
        toast.error("Failed to delete records");
      }
    } catch (error) {
      toast.error("Error deleting records");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteDateRange = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/delete-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "dateRange",
          startDate: dateRangeStart,
          endDate: dateRangeEnd,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Deleted ${result.deletedCount} records`);
        setData(data.filter((r) => {
          const t = new Date(r.timestamp);
          return t < new Date(dateRangeStart) || t > new Date(dateRangeEnd);
        }));
        setDateRangeStart("");
        setDateRangeEnd("");
      } else {
        toast.error("Failed to delete records");
      }
    } catch (error) {
      toast.error("Error deleting records");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/delete-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "all",
        }),
      });

      if (response.ok) {
        toast.success("All data deleted");
        setData([]);
        setFilteredData([]);
      } else {
        toast.error("Failed to delete all data");
      }
    } catch (error) {
      toast.error("Error deleting all data");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Timestamp", "Altitude (m)", "Temperature (°C)", "Humidity (%)", "Pressure (hPa)", "CO2 (ppm)", "Air Quality"],
      ...filteredData.map((r) => [
        r.timestamp,
        r.altitude,
        r.temperature_celsius,
        r.humidity_percent ?? "",
        r.air_pressure_hpa ?? "",
        r.co2_ppm ?? "",
        r.air_quality_index ?? "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sensor-data-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sensor-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast.success("JSON exported successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Management</h2>
        <p className="text-muted-foreground">View, filter, and manage sensor data records</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range Start</label>
              <input
                type="datetime-local"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date Range End</label>
              <input
                type="datetime-local"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setDateRangeStart(""); setDateRangeEnd(""); }}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              Export as CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              Export as JSON
            </Button>
            {selectedRows.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteMode("individual");
                  setShowDeleteConfirm(true);
                }}
              >
                Delete Selected ({selectedRows.size})
              </Button>
            )}
            {dateRangeStart && dateRangeEnd && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteMode("dateRange");
                  setShowDeleteConfirm(true);
                }}
              >
                Delete Date Range
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteMode("all");
                setShowDeleteConfirm(true);
              }}
            >
              Delete ALL Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sensor Data ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="w-10 px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <SortableHeader column="timestamp" label="Timestamp" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                    <SortableHeader column="altitude" label="Altitude (m)" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                    <SortableHeader column="temperature_celsius" label="Temp (°C)" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                    <SortableHeader column="humidity_percent" label="Humidity (%)" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                    <SortableHeader column="air_pressure_hpa" label="Pressure (hPa)" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                    <SortableHeader column="co2_ppm" label="CO2 (ppm)" onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.timestamp} className="border-b hover:bg-muted/50">
                      <td className="w-10 px-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.timestamp)}
                          onChange={(e) => handleSelectRow(row.timestamp, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="px-3 py-3">{row.altitude.toFixed(2)}</td>
                      <td className="px-3 py-3">{row.temperature_celsius.toFixed(1)}</td>
                      <td className="px-3 py-3">{row.humidity_percent ? row.humidity_percent.toFixed(1) : "-"}</td>
                      <td className="px-3 py-3">{row.air_pressure_hpa ? row.air_pressure_hpa.toFixed(1) : "-"}</td>
                      <td className="px-3 py-3">{row.co2_ppm ? row.co2_ppm.toFixed(0) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteMode === "individual" && `Are you sure you want to delete ${selectedRows.size} selected record(s)? This action cannot be undone.`}
            {deleteMode === "dateRange" && `Are you sure you want to delete all records between ${dateRangeStart} and ${dateRangeEnd}? This action cannot be undone.`}
            {deleteMode === "all" && "Are you sure you want to DELETE ALL data? This action cannot be undone and is irreversible."}
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteMode === "individual") handleDeleteSelected();
                else if (deleteMode === "dateRange") handleDeleteDateRange();
                else if (deleteMode === "all") handleDeleteAll();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableHeader({
  column,
  label,
  onSort,
  sortColumn,
  sortDirection,
}: {
  column: string;
  label: string;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}) {
  return (
    <th
      className="px-3 py-3 text-left cursor-pointer hover:bg-muted/50 font-semibold"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortColumn === column && (
          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );
}
