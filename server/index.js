import express from "express";
import dotenv from "dotenv";

dotenv.config();

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
    minLat: parseFloat(userLat) - 0.01,
    maxLat: parseFloat(userLat) + 0.01,
    minLon: parseFloat(userLon) - 0.01,
    maxLon: parseFloat(userLon) + 0.01,
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
