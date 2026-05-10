import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { Tables } from "@/integrations/ibb/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Car, Bus, Truck, MapPin, Clock, Crown } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Vehicle = Tables<"vehicles">;

// Custom vehicle icons
const createVehicleIcon = (type: string, isActive: boolean, isVip: boolean) => {
  const color = !isActive ? "#6b7280" : isVip ? "#f59e0b" : "#22c55e";
  
  return L.divIcon({
    className: "custom-vehicle-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          ${type === "bus" 
            ? '<rect x="1" y="3" width="22" height="14" rx="2"/><line x1="4" y1="21" x2="4" y2="17"/><line x1="20" y1="21" x2="20" y2="17"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'
            : type === "van"
            ? '<path d="M5 18H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M10 5v6h5"/><circle cx="7" cy="18" r="2"/><path d="M15 10h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><circle cx="17" cy="18" r="2"/>'
            : '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>'
          }
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to update map view
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

export const AdminFleetMap = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Bangkok center as default
  const defaultCenter: [number, number] = [13.7563, 100.5018];

  const fetchVehicles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("vehicle_type", { ascending: true });

    if (error) {
      toast({
        title: "Error fetching vehicles",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setVehicles(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVehicles();

    // Subscribe to realtime updates for vehicles table
    const channel = supabase
      .channel("vehicles-location")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const vehiclesWithLocation = vehicles.filter(
    (v) => v.current_lat !== null && v.current_lng !== null
  );

  const activeCount = vehicles.filter((v) => v.is_active).length;
  const vipCount = vehicles.filter((v) => v.is_vip).length;
  const withLocationCount = vehiclesWithLocation.length;

  const formatLastUpdate = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "van":
        return <Truck className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-montserrat text-foreground">
          Fleet Map
        </h2>
        <Button onClick={fetchVehicles} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{vipCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With GPS Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{withLocationCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-muted">
                <div className="text-muted-foreground">Loading map...</div>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={11}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {vehiclesWithLocation.map((vehicle) => (
                  <Marker
                    key={vehicle.id}
                    position={[vehicle.current_lat!, vehicle.current_lng!]}
                    icon={createVehicleIcon(
                      vehicle.vehicle_type,
                      vehicle.is_active ?? false,
                      vehicle.is_vip ?? false
                    )}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          {getVehicleIcon(vehicle.vehicle_type)}
                          <span className="font-bold">{vehicle.license_plate}</span>
                          {vehicle.is_vip && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="capitalize">{vehicle.vehicle_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Brand:</span>
                            <span>{vehicle.brand || "-"} {vehicle.model || ""}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span>{vehicle.capacity} passengers</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={vehicle.is_active ? "default" : "secondary"}
                              className={
                                vehicle.is_active
                                  ? "bg-green-500/20 text-green-700"
                                  : ""
                              }
                            >
                              {vehicle.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground mt-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              Updated: {formatLastUpdate(vehicle.last_location_update)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {vehiclesWithLocation.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vehicles with GPS location data</p>
              <p className="text-sm">Vehicle locations will appear here when GPS data is available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehiclesWithLocation.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getVehicleIcon(vehicle.vehicle_type)}
                      <span className="font-semibold">{vehicle.license_plate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {vehicle.is_vip && (
                        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      <Badge
                        variant={vehicle.is_active ? "default" : "secondary"}
                        className={
                          vehicle.is_active
                            ? "bg-green-500/20 text-green-700 border-green-500/30"
                            : ""
                        }
                      >
                        {vehicle.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      {vehicle.brand || "-"} {vehicle.model || ""}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {vehicle.current_lat?.toFixed(4)}, {vehicle.current_lng?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last update: {formatLastUpdate(vehicle.last_location_update)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
