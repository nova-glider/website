const axios = require("axios");
const express = require("express");
const app = express();

function getLatestSensorData() {
  const url = "http://localhost:3000/api/sensor-data/get";
  const api_key = "YOUR_API_KEY_HERE"; // not needed yet, but will be used in the future

  const headers = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${api_key}`
  };

  return axios
    .get(url, { headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        return error.response.data;
      } else {
        return { error: "Couldnt reach API endpoint" };
      }
    });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// homepage which displays the latest sensor data
app.get("/", (req, res) => {
  getLatestSensorData().then((latestData) => {
    console.log("Latest Sensor Data:", latestData);
    res.send("Sensor Data Client Example<br><br>" + JSON.stringify(latestData));
  });
  return;
});

// Start the Express server
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
