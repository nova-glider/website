const axios = require('axios');

const url = "http://localhost:3000/api/sensor-data/add";
const api_key = "YOUR_API_KEY_HERE"; // not needed yet, but will be used in the future

const data = {
    device_id: "sensor-001",
    timestamp: "2025-06-05T14:23:45Z",
    location: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 15.5
    },
    readings: {
        temperature_celsius: 22.8,
        humidity_percent: 58.3,
        air_pressure_hpa: 1013.2,
        air_quality_index: 42,
        co2_ppm: 415
    },
    status: {
        battery_level_percent: 76,
        signal_strength_dbm: -67,
        operational: true
    }
};

const headers = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${api_key}`
};

axios.post(url, data, { headers })
    .then(response => {
        console.log("Status Code:", response.status);
        console.log("Response Body:", response.data);
    })
    .catch(error => {
        if (error.response) {
            console.log("Status Code:", error.response.status);
            console.log("Response Body:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    });
