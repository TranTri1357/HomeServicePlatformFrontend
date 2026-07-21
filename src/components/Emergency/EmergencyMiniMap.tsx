import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";



const custIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 27 15 27s15-17 15-27C30 6.7 23.3 0 15 0z" fill="#ef4444"/><circle cx="15" cy="15" r="6" fill="white"/></svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});


export function EmergencyMiniMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={custIcon} />
    </MapContainer>
  );
}
