import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Navigation, Gauge } from 'lucide-react';

// Custom marker icons
const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TrackingMapProps {
  vehicleLat: number | null;
  vehicleLng: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  speed?: number | null;
  heading?: number | null;
  vehicleInfo?: {
    licensePlate?: string;
    brand?: string;
    model?: string;
  };
  isLive?: boolean;
}

// Component to update map view to fit all markers
function MapBoundsUpdater({ 
  vehicleLat, vehicleLng, pickupLat, pickupLng, dropoffLat, dropoffLng 
}: { 
  vehicleLat: number | null; 
  vehicleLng: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
}) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (hasInitialized) return;
    
    const points: L.LatLngExpression[] = [];
    if (vehicleLat && vehicleLng) points.push([vehicleLat, vehicleLng]);
    if (pickupLat && pickupLng) points.push([pickupLat, pickupLng]);
    if (dropoffLat && dropoffLng) points.push([dropoffLat, dropoffLng]);
    
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
      setHasInitialized(true);
    } else if (points.length === 1) {
      map.setView(points[0], 15);
      setHasInitialized(true);
    }
  }, [vehicleLat, vehicleLng, pickupLat, pickupLng, dropoffLat, dropoffLng, map, hasInitialized]);
  
  // Smoothly follow vehicle when it moves
  useEffect(() => {
    if (hasInitialized && vehicleLat && vehicleLng) {
      map.panTo([vehicleLat, vehicleLng], { animate: true, duration: 0.5 });
    }
  }, [vehicleLat, vehicleLng, map, hasInitialized]);
  
  return null;
}

const TrackingMap = ({ 
  vehicleLat, vehicleLng, 
  pickupLat, pickupLng, 
  dropoffLat, dropoffLng,
  speed,
  heading,
  vehicleInfo,
  isLive = false
}: TrackingMapProps) => {
  // Default center: Bangkok
  const defaultCenter: [number, number] = [13.7563, 100.5018];
  
  const center: [number, number] = vehicleLat && vehicleLng 
    ? [vehicleLat, vehicleLng] 
    : pickupLat && pickupLng 
      ? [pickupLat, pickupLng]
      : defaultCenter;

  // Create polyline path from vehicle to dropoff
  const routePath: [number, number][] = [];
  if (vehicleLat && vehicleLng) routePath.push([vehicleLat, vehicleLng]);
  if (dropoffLat && dropoffLng) routePath.push([dropoffLat, dropoffLng]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Badge variant="destructive" className="animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            LIVE
          </Badge>
        </div>
      )}
      
      {/* Speed & Heading indicator */}
      {(speed !== null && speed !== undefined) && (
        <div className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">{Math.round(speed)}</span>
              <span className="text-xs text-muted-foreground">km/h</span>
            </div>
            {heading !== null && heading !== undefined && (
              <div className="flex items-center gap-1">
                <Navigation 
                  className="h-4 w-4 text-primary transition-transform" 
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater 
          vehicleLat={vehicleLat}
          vehicleLng={vehicleLng}
          pickupLat={pickupLat}
          pickupLng={pickupLng}
          dropoffLat={dropoffLat}
          dropoffLng={dropoffLng}
        />
        
        {/* Route line from vehicle to dropoff */}
        {routePath.length === 2 && (
          <Polyline 
            positions={routePath}
            pathOptions={{ 
              color: 'hsl(var(--primary))', 
              weight: 3, 
              opacity: 0.7,
              dashArray: '10, 10'
            }}
          />
        )}
        
        {/* Vehicle marker */}
        {vehicleLat && vehicleLng && (
          <Marker position={[vehicleLat, vehicleLng]} icon={vehicleIcon}>
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-semibold">🚗 รถของคุณ</p>
                {vehicleInfo?.licensePlate && (
                  <p>ทะเบียน: {vehicleInfo.licensePlate}</p>
                )}
                {vehicleInfo?.brand && vehicleInfo?.model && (
                  <p>{vehicleInfo.brand} {vehicleInfo.model}</p>
                )}
                {speed !== null && speed !== undefined && (
                  <p>ความเร็ว: {Math.round(speed)} km/h</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Pickup marker */}
        {pickupLat && pickupLng && (
          <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">📍 จุดรับ</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Dropoff marker */}
        {dropoffLat && dropoffLng && (
          <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">🏁 จุดส่ง</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;
