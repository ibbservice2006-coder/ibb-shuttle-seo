import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/ibb/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface FestivalPrice {
  id: string;
  festival_name: string;
  zone_price_id: string;
  adjusted_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  zone_prices?: {
    id: string;
    base_price: number;
    vehicle_type: string;
    from_zone?: { zone_name_en: string };
    to_zone?: { zone_name_en: string };
  };
}

interface ZonePrice {
  id: string;
  base_price: number;
  vehicle_type: string;
  from_zone: { zone_name_en: string };
  to_zone: { zone_name_en: string };
}

export const FestivalPricingManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState<FestivalPrice | null>(null);
  const [formData, setFormData] = useState({
    festival_name: "",
    zone_price_id: "",
    adjusted_price: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  // Fetch festival prices with zone price details
  const { data: festivalPrices, isLoading } = useQuery({
    queryKey: ['festival-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('festival_prices')
        .select(`
          *,
          zone_prices (
            id,
            base_price,
            vehicle_type,
            from_zone:zones!zone_prices_from_zone_id_fkey(zone_name_en),
            to_zone:zones!zone_prices_to_zone_id_fkey(zone_name_en)
          )
        `)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as FestivalPrice[];
    }
  });

  // Fetch zone prices for dropdown
  const { data: zonePrices } = useQuery({
    queryKey: ['zone-prices-for-festival'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zone_prices')
        .select(`
          id,
          base_price,
          vehicle_type,
          from_zone:zones!zone_prices_from_zone_id_fkey(zone_name_en),
          to_zone:zones!zone_prices_to_zone_id_fkey(zone_name_en)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ZonePrice[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('festival_prices').insert({
        festival_name: data.festival_name,
        zone_price_id: data.zone_price_id,
        adjusted_price: parseFloat(data.adjusted_price),
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-prices'] });
      toast.success('Festival price created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create festival price: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('festival_prices')
        .update({
          festival_name: data.festival_name,
          zone_price_id: data.zone_price_id,
          adjusted_price: parseFloat(data.adjusted_price),
          start_date: data.start_date,
          end_date: data.end_date,
          is_active: data.is_active
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-prices'] });
      toast.success('Festival price updated successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update festival price: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('festival_prices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-prices'] });
      toast.success('Festival price deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete festival price: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      festival_name: "",
      zone_price_id: "",
      adjusted_price: "",
      start_date: "",
      end_date: "",
      is_active: true
    });
    setEditingFestival(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (festival: FestivalPrice) => {
    setEditingFestival(festival);
    setFormData({
      festival_name: festival.festival_name,
      zone_price_id: festival.zone_price_id,
      adjusted_price: festival.adjusted_price.toString(),
      start_date: festival.start_date,
      end_date: festival.end_date,
      is_active: festival.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFestival) {
      updateMutation.mutate({ id: editingFestival.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getZonePriceLabel = (zp: ZonePrice) => {
    const fromZone = zp.from_zone?.zone_name_en || 'Unknown';
    const toZone = zp.to_zone?.zone_name_en || 'Unknown';
    return `${fromZone} → ${toZone} (${zp.vehicle_type}) - ฿${zp.base_price}`;
  };

  const isFestivalActive = (festival: FestivalPrice) => {
    const now = new Date();
    const start = new Date(festival.start_date);
    const end = new Date(festival.end_date);
    return festival.is_active && now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-montserrat text-foreground">Festival Pricing Management</h2>
          <p className="text-muted-foreground">Manage special prices for festivals and holidays</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Festival Price
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFestival ? 'Edit Festival Price' : 'Add Festival Price'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="festival_name">Festival Name</Label>
                <Input
                  id="festival_name"
                  value={formData.festival_name}
                  onChange={(e) => setFormData({ ...formData, festival_name: e.target.value })}
                  placeholder="e.g., Songkran 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone_price">Route</Label>
                <Select
                  value={formData.zone_price_id}
                  onValueChange={(value) => setFormData({ ...formData, zone_price_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonePrices?.map((zp) => (
                      <SelectItem key={zp.id} value={zp.id}>
                        {getZonePriceLabel(zp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjusted_price">Festival Price (THB)</Label>
                <Input
                  id="adjusted_price"
                  type="number"
                  step="0.01"
                  value={formData.adjusted_price}
                  onChange={(e) => setFormData({ ...formData, adjusted_price: e.target.value })}
                  placeholder="2500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFestival ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5" />
            Festival Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : festivalPrices?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No festival prices configured yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Festival</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Festival Price</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {festivalPrices?.map((festival) => (
                  <TableRow key={festival.id}>
                    <TableCell className="font-medium">{festival.festival_name}</TableCell>
                    <TableCell>
                      {festival.zone_prices ? (
                        <span className="text-sm">
                          {festival.zone_prices.from_zone?.zone_name_en || 'N/A'} → {festival.zone_prices.to_zone?.zone_name_en || 'N/A'}
                          <br />
                          <span className="text-muted-foreground">({festival.zone_prices.vehicle_type})</span>
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>฿{festival.zone_prices?.base_price || 'N/A'}</TableCell>
                    <TableCell className="font-semibold text-primary">฿{festival.adjusted_price}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(festival.start_date), 'MMM d, yyyy')} - {format(new Date(festival.end_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {isFestivalActive(festival) ? (
                        <Badge className="bg-green-500">Active Now</Badge>
                      ) : festival.is_active ? (
                        <Badge variant="secondary">Scheduled</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(festival)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMutation.mutate(festival.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
