const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let latestData = {};

// if the db directory does not exist, create it
if (!fs.existsSync("./db")) {
  fs.mkdirSync("./db");
}

app.get("/", (req, res) => {
  res.send("Backend operational.")
});

// TODO:
// - API token
// - Database connection
app.post("/api/sensor-data/add", (req, res) => {
  const { timestamp } = req.body;

  const latestData = req.body;

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

app.get("/api/sensor-data/get", (req, res) => {
  // fetch the latest sensor data and show it on the homepage
  if (Object.keys(latestData).length === 0) {
    console.log("No latest data found, reading from db directory...");
    fs.readdir("./db", (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return res.status(500).send({"error": "Error reading sensor data"});
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
            return res.status(500).send({"error": "Error reading sensor data"});
          }
          latestData = JSON.parse(data);
          res.send(latestData);
        });
      } else {
        res.send({"error": "No sensor data available."});
      }
    });
  } else {
    res.send(latestData);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
