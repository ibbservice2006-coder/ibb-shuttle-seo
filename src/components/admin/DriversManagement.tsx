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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Star } from "lucide-react";

type Driver = Tables<"drivers">;

export const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    license_number: "",
    is_active: true,
  });
  const { toast } = useToast();

  const fetchDrivers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching drivers",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDrivers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const resetForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      license_number: "",
      is_active: true,
    });
    setEditingDriver(null);
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        full_name: driver.full_name,
        phone: driver.phone,
        license_number: driver.license_number,
        is_active: driver.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDriver) {
      const { error } = await supabase
        .from("drivers")
        .update(formData)
        .eq("id", editingDriver.id);

      if (error) {
        toast({
          title: "Error updating driver",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Driver updated successfully" });
        setIsDialogOpen(false);
        fetchDrivers();
      }
    } else {
      const { error } = await supabase.from("drivers").insert([formData]);

      if (error) {
        toast({
          title: "Error creating driver",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Driver created successfully" });
        setIsDialogOpen(false);
        fetchDrivers();
      }
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    const { error } = await supabase.from("drivers").delete().eq("id", driverId);

    if (error) {
      toast({
        title: "Error deleting driver",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Driver deleted successfully" });
      fetchDrivers();
    }
  };

  const toggleDriverStatus = async (driver: Driver) => {
    const { error } = await supabase
      .from("drivers")
      .update({ is_active: !driver.is_active })
      .eq("id", driver.id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchDrivers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-montserrat text-foreground">
          Drivers Management
        </h2>
        <div className="flex gap-2">
          <Button onClick={fetchDrivers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDriver ? "Edit Driver" : "Add New Driver"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) =>
                      setFormData({ ...formData, license_number: e.target.value })
                    }
                    required
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
                    {editingDriver ? "Update" : "Create"}
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
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License #</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Total Trips</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading drivers...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.full_name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.license_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{driver.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{driver.total_trips || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={driver.is_active ? "default" : "secondary"}
                      className={
                        driver.is_active
                          ? "bg-green-500/20 text-green-700 border-green-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {driver.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(driver)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleDriverStatus(driver)}
                      >
                        <Switch
                          checked={driver.is_active ?? false}
                          className="pointer-events-none"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(driver.id)}
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
