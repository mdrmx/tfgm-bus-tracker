export async function getBusData(userLat, userLon, lineRef = null) {
  let url = `/busData?userLat=${userLat}&userLon=${userLon}&lineRef=${lineRef}`;

  const response = await fetch(url);
  const xmlText = await response.text();
  const buses = parseBusData(xmlText);

  return buses;
}

// Function to parse SIRI XML bus data
function parseBusData(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  // SIRI namespace
  const ns = "http://www.siri.org.uk/siri";
  const vehicles = xml.getElementsByTagNameNS(ns, "VehicleActivity");

  const buses = [];

  for (const vehicle of vehicles) {
    // Helper function to safely get tag values
    const getTagValue = (tagName) => {
      const el = vehicle.getElementsByTagNameNS(ns, tagName)[0];
      return el ? el.textContent : null;
    };
    console.log(vehicle);
    // Push bus data into array, ensuring lat/lon are parsed as floats
    buses.push({
      lat: parseFloat(getTagValue("Latitude")),
      lon: parseFloat(getTagValue("Longitude")),
      line: getTagValue("PublishedLineName"),
      destination: getTagValue("DestinationName"),
      operator: getTagValue("OperatorRef"),
      vehicleRef: getTagValue("VehicleRef"),
      journeyCode: getTagValue("JourneyCode"),
      originName: getTagValue("OriginName"),
      destinationName: getTagValue("DestinationName"),
      aimedArrivalTime: getTagValue("DestinationAimedArrivalTime"),
    });
  }

  return buses;
}

export function getBusStops() {
  return fetch("/busStops")
    .then((response) => response.json())
    .then((data) => {
      console.log("Bus stops data received:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching bus stops:", error);
      return [];
    });
}
