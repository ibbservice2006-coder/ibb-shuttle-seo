import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { Tables } from "@/integrations/ibb/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Car, Bus, Truck, Crown } from "lucide-react";

type Vehicle = Tables<"vehicles">;

const vehicleTypeOptions = [
  { value: "car", label: "Car", icon: Car },
  { value: "van", label: "Van", icon: Truck },
  { value: "bus", label: "Bus", icon: Bus },
];

export const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    license_plate: "",
    brand: "",
    model: "",
    vehicle_type: "car" as "car" | "van" | "bus",
    capacity: 4,
    is_active: true,
    is_vip: false,
  });
  const { toast } = useToast();

  const fetchVehicles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

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
  }, []);

  const resetForm = () => {
    setFormData({
      license_plate: "",
      brand: "",
      model: "",
      vehicle_type: "car",
      capacity: 4,
      is_active: true,
      is_vip: false,
    });
    setEditingVehicle(null);
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        license_plate: vehicle.license_plate,
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        vehicle_type: vehicle.vehicle_type,
        capacity: vehicle.capacity,
        is_active: vehicle.is_active ?? true,
        is_vip: vehicle.is_vip ?? false,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(formData)
        .eq("id", editingVehicle.id);

      if (error) {
        toast({
          title: "Error updating vehicle",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Vehicle updated successfully" });
        setIsDialogOpen(false);
        fetchVehicles();
      }
    } else {
      const { error } = await supabase.from("vehicles").insert([formData]);

      if (error) {
        toast({
          title: "Error creating vehicle",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Vehicle created successfully" });
        setIsDialogOpen(false);
        fetchVehicles();
      }
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);

    if (error) {
      toast({
        title: "Error deleting vehicle",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Vehicle deleted successfully" });
      fetchVehicles();
    }
  };

  const toggleVehicleStatus = async (vehicle: Vehicle) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ is_active: !vehicle.is_active })
      .eq("id", vehicle.id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchVehicles();
    }
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
          Vehicles Management
        </h2>
        <div className="flex gap-2">
          <Button onClick={fetchVehicles} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_plate">License Plate</Label>
                    <Input
                      id="license_plate"
                      value={formData.license_plate}
                      onChange={(e) =>
                        setFormData({ ...formData, license_plate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select
                      value={formData.vehicle_type}
                      onValueChange={(value: "car" | "van" | "bus") =>
                        setFormData({ ...formData, vehicle_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Passenger Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    max={50}
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_vip">VIP Vehicle</Label>
                  <Switch
                    id="is_vip"
                    checked={formData.is_vip}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_vip: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVehicle ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Brand / Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>VIP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading vehicles...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No vehicles found
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVehicleIcon(vehicle.vehicle_type)}
                      <span className="capitalize">{vehicle.vehicle_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vehicle.brand || "-"} {vehicle.model || ""}
                  </TableCell>
                  <TableCell>{vehicle.capacity} passengers</TableCell>
                  <TableCell>
                    {vehicle.is_vip && (
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={vehicle.is_active ? "default" : "secondary"}
                      className={
                        vehicle.is_active
                          ? "bg-green-500/20 text-green-700 border-green-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {vehicle.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVehicleStatus(vehicle)}
                      >
                        <Switch
                          checked={vehicle.is_active ?? false}
                          className="pointer-events-none"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
