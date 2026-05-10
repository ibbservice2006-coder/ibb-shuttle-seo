import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/ibb/client";
import { toast } from "sonner";
import { Navigation, Locate, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom driver icon
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DriverGPSMapProps {
  driverId: string;
  vehicleId?: string;
  bookingId?: string;
}

const translations = {
  en: {
    title: "GPS Location",
    updateLocation: "Update My Location",
    updating: "Updating...",
    locationUpdated: "Location updated successfully",
    locationError: "Failed to get location",
    permissionDenied: "Location permission denied",
    status: "Status",
    tracking: "Tracking Active",
    lastUpdate: "Last Update",
    latitude: "Latitude",
    longitude: "Longitude",
    speed: "Speed"
  },
  th: {
    title: "ตำแหน่ง GPS",
    updateLocation: "อัปเดตตำแหน่งของฉัน",
    updating: "กำลังอัปเดต...",
    locationUpdated: "อัปเดตตำแหน่งสำเร็จ",
    locationError: "ไม่สามารถรับตำแหน่งได้",
    permissionDenied: "ไม่ได้รับอนุญาตเข้าถึงตำแหน่ง",
    status: "สถานะ",
    tracking: "กำลังติดตาม",
    lastUpdate: "อัปเดตล่าสุด",
    latitude: "ละติจูด",
    longitude: "ลองจิจูด",
    speed: "ความเร็ว"
  }
};

// Component to handle map center updates
const MapUpdater = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
};

const DriverGPSMap = ({ driverId, vehicleId, bookingId }: DriverGPSMapProps) => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Default center (Bangkok)
  const defaultCenter: [number, number] = [13.7563, 100.5018];

  useEffect(() => {
    // Start watching position
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPosition);
          setSpeed(pos.coords.speed);
          setHeading(pos.coords.heading);
          setLastUpdate(new Date());
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const updateLocationToServer = async () => {
    if (!position || !vehicleId) return;

    setIsUpdating(true);
    try {
      // Update vehicle location
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({
          current_lat: position[0],
          current_lng: position[1],
          last_location_update: new Date().toISOString()
        })
        .eq("id", vehicleId);

      if (vehicleError) throw vehicleError;

      // If there's an active booking, also log to gps_tracking
      if (bookingId) {
        const { error: trackingError } = await supabase
          .from("gps_tracking")
          .insert({
            vehicle_id: vehicleId,
            booking_id: bookingId,
            latitude: position[0],
            longitude: position[1],
            speed: speed,
            heading: heading
          });

        if (trackingError) {
          console.error("GPS tracking insert error:", trackingError);
        }
      }

      toast.success(t.locationUpdated);
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error(t.locationError);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error(t.locationError);
      return;
    }

    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPosition);
        setSpeed(pos.coords.speed);
        setHeading(pos.coords.heading);
        setLastUpdate(new Date());
        setIsUpdating(false);
        
        // Automatically update to server if vehicleId is available
        if (vehicleId) {
          updateLocationToServer();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsUpdating(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t.permissionDenied);
        } else {
          toast.error(t.locationError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <Badge variant={position ? "default" : "secondary"}>
            {position ? t.tracking : t.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="h-[300px] rounded-lg overflow-hidden border">
          <MapContainer
            center={position || defaultCenter}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater position={position} />
            {position && (
              <Marker position={position} icon={driverIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                    <br />
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t.latitude}:</span>
            <span className="ml-2 font-mono">{position ? position[0].toFixed(6) : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t.longitude}:</span>
            <span className="ml-2 font-mono">{position ? position[1].toFixed(6) : "—"}</span>
          </div>
          {speed !== null && (
            <div>
              <span className="text-muted-foreground">{t.speed}:</span>
              <span className="ml-2">{(speed * 3.6).toFixed(1)} km/h</span>
            </div>
          )}
          {lastUpdate && (
            <div>
              <span className="text-muted-foreground">{t.lastUpdate}:</span>
              <span className="ml-2">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            disabled={isUpdating}
            variant="outline"
            className="flex-1"
          >
            <Locate className="h-4 w-4 mr-2" />
            {isUpdating ? t.updating : t.updateLocation}
          </Button>
          {vehicleId && position && (
            <Button
              onClick={updateLocationToServer}
              disabled={isUpdating}
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isUpdating ? t.updating : "Send to Server"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverGPSMap;
