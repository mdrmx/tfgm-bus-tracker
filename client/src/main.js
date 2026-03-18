import { getBusData, getBusStops } from "./api";
import { initMap, updateMarkers, busStopMarkers } from "./components/map.js";
import { buildUI } from "./components/ui.js";
import "./style.css";

let line = 42;

const initApp = async () => {
  const appContainer = document.getElementById("app");
  const { userLat, userLon } = await getUserLocation();
  const buses = await getBusData(userLat, userLon, line);
  console.log("Bus data received in main.js:", buses);

  const { container, input, button, routeNumber } = buildUI();
  routeNumber.textContent = `Route ${line}`;

  const search = async () => {
    line = input.value.trim();
    routeNumber.textContent = `Route ${line}`;

    const updatedBuses = await getBusData(userLat, userLon, line);
    console.log("Updated bus data received:", updatedBuses);
    updateMarkers(updatedBuses);
  };

  button.addEventListener("click", search);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search();
  });
  document.body.appendChild(container);

  const map = document.createElement("div");
  map.id = "map";
  appContainer.appendChild(map);

  await initMap({ lat: userLat, lon: userLon });
  updateMarkers(buses);
  getBusStops().then((stops) => {
    console.log("Bus stops data in main.js:", stops);
    busStopMarkers(stops, userLat, userLon);
  });
  setInterval(async () => {
    line = input.value.trim() || line;
    const updatedBuses = await getBusData(userLat, userLon, line);
    console.log("Updated bus data received:", updatedBuses);
    updateMarkers(updatedBuses);
  }, 10000); // Refresh every 10 seconds
};

initApp();

async function getUserLocation() {
  if ("geolocation" in navigator) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User location obtained:", latitude, longitude);
          resolve({ userLat: latitude, userLon: longitude });
        },
        (error) => {
          console.error("Error obtaining geolocation:", error);
          reject(error);
        },
      );
    });
  } else {
    throw new Error("Geolocation is not supported by this browser.");
  }
}
