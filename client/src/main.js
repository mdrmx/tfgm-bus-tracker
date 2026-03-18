import { getBusData } from "./api";
import { initMap, updateMarkers } from "./components/map.js";
import "./style.css";

const initApp = async () => {
  const appContainer = document.getElementById("app");
  const { userLat, userLon } = await getUserLocation();
  const buses = await getBusData(userLat, userLon, "");
  console.log("Bus data received in main.js:", buses);

  const map = document.createElement("div");
  map.id = "map";
  appContainer.appendChild(map);

  await initMap({ lat: userLat, lon: userLon });
  updateMarkers(buses);
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
