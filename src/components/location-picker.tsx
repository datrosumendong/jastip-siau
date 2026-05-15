
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issues in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({
  initialLat = -2.5489, 
  initialLng = 118.0149,
  onLocationSelect,
  height = '300px',
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  useEffect(() => {
    if (initialLat !== 0 && initialLng !== 0) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    /**
     * PERBAIKAN Z-INDEX: Menggunakan 'relative z-0' dan 'isolate' 
     * untuk memastikan peta Leaflet tidak menembus lapisan UI Sidebar (z-50).
     */
    <div className="rounded-xl overflow-hidden border shadow-inner bg-muted/20 relative z-0 isolate w-full" style={{ height }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
        <MapEvents onLocationSelect={handleLocationChange} />
        <RecenterMap lat={position[0]} lng={position[1]} />
      </MapContainer>
    </div>
  );
}
