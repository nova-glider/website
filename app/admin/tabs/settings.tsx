"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Settings</h2>
        <p className="text-muted-foreground">System configuration and security settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Admin panel security configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Password Protection</h4>
            <p className="text-sm text-muted-foreground">
              This admin panel is protected by a password. The password is configured via the <code className="bg-muted px-2 py-1 rounded text-sm">ADMIN_PASSWORD</code> environment variable.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              To set your admin password, add the following to your <code className="bg-muted px-2 py-1 rounded text-sm">.env.local</code> file:
            </p>
            <div className="bg-muted p-3 rounded mt-2 font-mono text-sm">
              ADMIN_PASSWORD=your_secure_password
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CORS Configuration</CardTitle>
          <CardDescription>Cross-Origin Resource Sharing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Allowed Origins</h4>
            <p className="text-sm text-muted-foreground">
              API endpoints are protected by CORS (Cross-Origin Resource Sharing) rules. Configure allowed origins via the <code className="bg-muted px-2 py-1 rounded text-sm">ALLOWED_ORIGINS</code> environment variable.
            </p>
            <div className="bg-muted p-3 rounded mt-2 font-mono text-sm">
              ALLOWED_ORIGINS=http://localhost:3000,https://example.com
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Default: <code className="bg-muted px-2 py-1 rounded text-sm">http://localhost:3000</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database</CardTitle>
          <CardDescription>Sensor data storage information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Storage Location</h4>
            <p className="text-sm text-muted-foreground">
              Sensor data is stored as JSON files in the <code className="bg-muted px-2 py-1 rounded text-sm">db/</code> directory.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              File naming convention: <code className="bg-muted px-2 py-1 rounded text-sm">sensor-data-YYYYMMDDHHMMSS.json</code>
            </p>
          </div>
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold">Data Structure</h4>
            <p className="text-sm text-muted-foreground">
              Each sensor reading includes:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
              <li>Timestamp (ISO format)</li>
              <li>Altitude (meters)</li>
              <li>Temperature (Celsius)</li>
              <li>Humidity (percent)</li>
              <li>Air Pressure (hPa)</li>
              <li>CO2 Level (ppm)</li>
              <li>Air Quality Index</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available admin and sensor data endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">GET /api/sensor-data/get/all</h4>
              <p className="text-muted-foreground">Retrieve all sensor data records</p>
            </div>
            <div>
              <h4 className="font-semibold">GET /api/sensor-data/get/latest</h4>
              <p className="text-muted-foreground">Retrieve the most recent sensor reading</p>
            </div>
            <div>
              <h4 className="font-semibold">POST /api/sensor-data/add</h4>
              <p className="text-muted-foreground">Submit a new sensor reading</p>
            </div>
            <div>
              <h4 className="font-semibold">POST /api/admin/verify</h4>
              <p className="text-muted-foreground">Verify admin password (authentication)</p>
            </div>
            <div>
              <h4 className="font-semibold">GET /api/admin/stats</h4>
              <p className="text-muted-foreground">Retrieve system statistics and database info</p>
            </div>
            <div>
              <h4 className="font-semibold">POST /api/admin/delete-records</h4>
              <p className="text-muted-foreground">Delete sensor records (admin only)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
