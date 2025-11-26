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


const express = require("express");
const fs = require("fs");
const path = require("path");


const app = express();

app.set('views', path.join(__dirname, 'pages'));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "static")));



const cardsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "cards.json"), "utf8")
);

app.get("/", (req, res) => {
  res.render("index", { cards: cardsData.cards });
});

// ------------------
//      BACKEND
// ------------------

const cors = require("cors");
app.use(express.json()); // backend
app.use(express.urlencoded({ extended: true })); // backend

// Configure CORS
// If you want to restrict origins, set ALLOWED_ORIGINS to a comma-separated list, e.g. "https://example.com,http://localhost:3000"
// If ALLOWED_ORIGINS is not set, fallback to allowing localhost:3000 (adjust as needed).
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];

// If you want to allow everything (not recommended for production), set ALLOWED_ORIGINS='*'
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // non-browser requests (e.g., curl, server-to-server) have no origin; allow them
      return callback(null, true);
    }
    if (allowedOrigins.includes("*origin") || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for origin: " + origin));
    }
  },
  methods: ["GET", "POST"], //  "PUT", "DELETE", "OPTIONS"
  // allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware only to /api* routes (untested)
app.use("/api", cors(corsOptions));
// Allow preflight for all /api* routes
app.options("/api*", cors(corsOptions));

let latestData = {};
let sensorDataHistory = [];

// if the db directory does not exist, create it
if (!fs.existsSync("./db")) {
  fs.mkdirSync("./db");
}

// TODO:
// - API token
// - Database connection
app.post("/api/sensor-data/add", (req, res) => {
  const { timestamp } = req.body;

  // update in-memory latestData and sensorDataHistory (do not shadow the outer variable)
  latestData = req.body;
  sensorDataHistory.unshift(req.body);

  // Clean the timestamp to use as a filename (e.g., "20250605142345" from "2025-06-05T14:23:45Z")
  const timestampCleaned = timestamp.replace(/[-:T]/g, "").slice(0, 14);

  // save to ./db/sensor-data-${timestamp}.json
  fs.writeFile(
    `./db/sensor-data-${timestampCleaned}.json`,
    JSON.stringify(latestData),
    (err) => {
      if (err) {
        console.error("Error saving sensor data:", err);
        return res.status(500).send("Error saving sensor data");
      }
      res.status(200).send("Sensor data saved successfully");
    }
  );
});

app.get("/api/sensor-data/get/all", (req, res) => {
  // fetch the latest sensor data and show it on the homepage
  if (Object.keys(sensorDataHistory).length === 0) {
    console.log("No latest data found, reading from db directory...");
    fs.readdir("./db", (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return res.status(500).send({ error: "Error reading sensor data" });
      }

      // Sort files by timestamp (assuming filenames are in the format sensor-data-YYYYMMDDHHMMSS.json)
      files.sort((a, b) => {
        const timeA = a.match(/sensor-data-(\d+)\.json/)[1];
        const timeB = b.match(/sensor-data-(\d+)\.json/)[1];
        return timeB.localeCompare(timeA); // Sort descending
      });

      if (files.length > 0) {
        // Read all files and append their data as array items in sensorDataHistory
        sensorDataHistory = [];
        let filesRead = 0;
        files.forEach((file, idx) => {
          fs.readFile(`./db/${file}`, "utf8", (err, data) => {
            filesRead++;
            if (!err) {
              try {
          sensorDataHistory.push(JSON.parse(data));
              } catch (parseErr) {
          console.error(`Error parsing file ${file}:`, parseErr);
              }
            } else {
              console.error(`Error reading file ${file}:`, err);
            }
            // Send response after all files are processed
            if (filesRead === files.length) {
              res.send(sensorDataHistory);
            }
          });
        });
      } else {
        res.send({ error: "No sensor data available." });
      }
    });
  } else {
    res.send(sensorDataHistory);
  }
});

app.get("/api/sensor-data/get/latest", (req, res) => {
  // fetch all sensor data sorted by timestamp
  if (Object.keys(latestData).length === 0) {
    console.log("No latest data found, reading from db directory...");
    fs.readdir("./db", (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return res.status(500).send({ error: "Error reading sensor data" });
      }

      // Sort files by timestamp (assuming filenames are in the format sensor-data-YYYYMMDDHHMMSS.json)
      files.sort((a, b) => {
        const timeA = a.match(/sensor-data-(\d+)\.json/)[1];
        const timeB = b.match(/sensor-data-(\d+)\.json/)[1];
        return timeB.localeCompare(timeA); // Sort descending
      });

      if (files.length > 0) {
        fs.readFile(`./db/${files[0]}`, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send({ error: "Error reading sensor data" });
          }
          latestData = JSON.parse(data);
          res.send(latestData);
        });
      } else {
        res.send({ error: "No sensor data available." });
      }
    });
  } else {
    res.send(latestData);
  }
});

// ----------------
//    dashboard
// ----------------

// Serve the exported Next.js static site
app.use('/dashboard', express.static(path.join(__dirname, 'pages/out')));

// (Optional) fallback for client-side routing
app.get('/dashboard*routes', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/out/index.html'));
});

// ----------------
//    LISTENER
// ----------------

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});