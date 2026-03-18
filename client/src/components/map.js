let mapInstance = null;
let marker = null;

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
}

//create marker update function triggered by new selection from dropdown menu
export function updateMarkers(data) {
  if (!mapInstance) {
    console.error("Map instance not initialized");
    return;
  } else {
    console.log("Updating markers with data:", data.slice(0, 5)); // Log the first few bus data entries for debugging
    // Clear existing markers
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== marker) {
        mapInstance.removeLayer(layer);
      }
    });
    // Add new markers
    data.forEach((bus) => {
      if (bus.lat && bus.lon) {
        L.marker([bus.lat, bus.lon])
          .addTo(mapInstance)
          .bindPopup(
            `<b>Line:</b> ${bus.line}<br><b>Origin:</b> ${bus.originName}<br><b>Destination:</b> ${bus.destinationName}<br><b>Operator:</b> ${bus.operator}`,
          );
      } else {
        console.warn("Skipping bus with missing coordinates:", bus);
      }
    });
  }
}
