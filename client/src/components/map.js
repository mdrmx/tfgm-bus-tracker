let mapInstance = null;
let marker = null;
let busMarkersLayer = null;
let stopMarkersLayer = null;

export async function initMap({ lat, lon }) {
  const mapContainer = document.getElementById("map");

  mapInstance = L.map(mapContainer).setView([lat, lon], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapInstance);

  marker = L.marker([lat, lon]).addTo(mapInstance);
  // marker.bindPopup("You are here").openPopup();

  //change marker colour to red
  marker.setIcon(
    L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
  );

  // Create layer groups for bus and stop markers
  busMarkersLayer = L.layerGroup().addTo(mapInstance);
  stopMarkersLayer = L.layerGroup().addTo(mapInstance);
}

//create marker update function triggered by new selection from dropdown menu
export function updateMarkers(data) {
  if (!mapInstance) {
    console.error("Map instance not initialized");
    return;
  } else {
    // Clear only bus markers
    busMarkersLayer.clearLayers();

    // Add new markers
    data.forEach((bus) => {
      if (bus.lat && bus.lon) {
        const origin = (bus.originName || "Unknown").replace(/_/g, " ");
        const destination = (bus.destinationName || "Unknown").replace(
          /_/g,
          " ",
        );

        const time = new Date(bus.aimedArrivalTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        L.marker([bus.lat, bus.lon], {
          icon: L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .addTo(busMarkersLayer)
          .bindPopup(
            `<b>Line:</b> ${bus.line}<br><b>Origin:</b> ${origin}<br><b>Destination:</b> ${destination}<br><b>Aimed Arrival Time:</b> ${time}<br>`,
          );
      } else {
        console.warn("Skipping bus with missing coordinates:", bus);
      }
    });
  }
}

export function busStopMarkers(stops, userLat, userLon) {
  if (!mapInstance) {
    console.error("Map instance not initialized");
    return;
  }

  // Filter stops within 250m of user location
  const nearbyStops = stops.filter((stop) => {
    if (!stop.Latitude || !stop.Longitude) return false;
    const distance = getDistanceMeters(
      userLat,
      userLon,
      parseFloat(stop.Latitude),
      parseFloat(stop.Longitude),
    );
    return distance <= 250;
  });

  nearbyStops.forEach((stop) => {
    L.marker([stop.Latitude, stop.Longitude])
      .addTo(stopMarkersLayer)
      .bindPopup(
        `<b>Stop Name:</b> ${stop.CommonName}<br><b>Stop Code:</b> ${stop.AtcoCode}<br><b>Stop Type:</b> ${stop.StopType}<br>`,
      );
  });
}

// Haversine formula to calculate distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
