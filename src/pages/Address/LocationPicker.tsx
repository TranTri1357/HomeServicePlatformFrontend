import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed, Search, MapPin, X } from "lucide-react";
import { notify } from "@/shared/lib";
import { searchAddresses, type GeoResult } from "@/services/vnAddress";

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 }; 

type LatLng = { lat: number; lng: number };


const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 27 15 27s15-17 15-27C30 6.7 23.3 0 15 0z" fill="#2563eb"/><circle cx="15" cy="15" r="6" fill="white"/></svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});


function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}


function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  
  value: LatLng | null;
  onChange: (lat: number, lng: number) => void;
  
  fallbackQuery?: string;
}


export function LocationPicker({ value, onChange, fallbackQuery }: LocationPickerProps) {
  const [center, setCenter] = useState<LatLng>(value ?? DEFAULT_CENTER);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const didInit = useRef(false);

  
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (value) {
      setCenter(value);
      return;
    }
    if (fallbackQuery?.trim()) {
      searchAddresses(fallbackQuery, 1)
        .then((r) => r[0] && setCenter({ lat: r[0].lat, lng: r[0].lng }))
        .catch(() => {
          
        });
    }
  }, [value, fallbackQuery]);

  
  
  useEffect(() => {
    if (value) setCenter(value);
    
  }, [value?.lat, value?.lng]);

  
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchAddresses(query, 5));
      } catch {
        
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    onChange(lat, lng);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify.error("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        notify.error("Không lấy được vị trí. Kiểm tra quyền định vị.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-2">
      {}
      <div className="relative">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm địa chỉ trên bản đồ..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          {searching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {query && !searching && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {results.length > 0 && (
          <div className="absolute z-[1000] left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-border max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={`${r.lat}-${r.lng}-${i}`}
                type="button"
                onClick={() => {
                  pick(r.lat, r.lng);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
              >
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-foreground">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="rounded-xl overflow-hidden" style={{ height: 200 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={value ? 16 : 13}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} />
          <ClickToPlace onPick={pick} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as L.Marker).getLatLng();
                  pick(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5" />
          )}
          Vị trí hiện tại
        </button>
        {value ? (
          <span className="text-[11px] text-green-600 font-medium">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Bấm lên bản đồ để đặt ghim</span>
        )}
      </div>
    </div>
  );
}
