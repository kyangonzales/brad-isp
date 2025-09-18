import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LeafletMouseEvent } from "leaflet";

interface MapsProps {
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
}

const Maps: React.FC<MapsProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const LocationMarker: React.FC = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) { 
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ latitude: lat, longitude: lng });
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  return (
	<MapContainer 
		center={[15.3506, 121.0412]} 
		zoom={14} 
		className="w-full h-96"
		>
	      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
};

export default Maps;
