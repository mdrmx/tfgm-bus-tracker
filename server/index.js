import express from "express";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

/////////////////////////////////////////
//// API endpoint to fetch bus
//// data based on user location
/////////////////////////////////////////
app.get("/busData", async (req, res) => {
  const { userLat, userLon, lineRef } = req.query;

  // Calculate bounding box for url parameters
  const boundingBox = {
    minLat: parseFloat(userLat) - 0.2,
    maxLat: parseFloat(userLat) + 0.2,
    minLon: parseFloat(userLon) - 0.2,
    maxLon: parseFloat(userLon) + 0.2,
  };
  try {
    let url = `https://data.bus-data.dft.gov.uk/api/v1/datafeed/?boundingBox=${boundingBox.minLon},${boundingBox.minLat},${boundingBox.maxLon},${boundingBox.maxLat}`;
    if (lineRef) {
      url += `&lineRef=${lineRef}`;
    }
    url += `&api_key=${apiKey}`;
    console.log("Fetching bus data with URL:", url); // Log the URL for debugging
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("data type: ", response.headers.get("content-type")); // Log content type for debugging
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error("Error fetching bus data:", error);
    res.status(500).json({ error: "Failed to fetch bus data" });
  }
});

app.get("/busStops", (req, res) => {
  try {
    const csvFilePath = join(__dirname, "data/TfGMStoppingPoints.csv");
    const data = readFileSync(csvFilePath, "utf8");

    const lines = data.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());

    const busStops = lines
      .slice(1)
      .map((line) => {
        // Handle CSV fields that may contain commas inside quotes
        const values = [];
        let current = "";
        let inQuotes = false;

        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const busStop = {};
        headers.forEach((header, index) => {
          busStop[header] = values[index] || "";
        });
        return busStop;
      })
      .filter((stop) => stop.StopType === "BCT" || stop.StopType === "RSE");

    res.json(busStops);
  } catch (err) {
    console.error("Error reading bus stops CSV file:", err);
    res.status(500).json({ error: "Failed to read bus stops data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
