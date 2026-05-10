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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, DollarSign } from "lucide-react";
import type { Database } from "@/integrations/ibb/types";

type VehicleType = Database["public"]["Enums"]["vehicle_type"];

interface Zone {
  id: string;
  zone_code: string;
  zone_name_en: string;
  zone_name_th: string;
  region: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface ZonePrice {
  id: string;
  from_zone_id: string;
  to_zone_id: string;
  vehicle_type: VehicleType;
  base_price: number;
  currency: string;
  is_active: boolean | null;
  from_zone?: Zone;
  to_zone?: Zone;
}

interface ZoneForm {
  zone_code: string;
  zone_name_en: string;
  zone_name_th: string;
  region: string;
  description: string;
  is_active: boolean;
}

interface PriceForm {
  from_zone_id: string;
  to_zone_id: string;
  vehicle_type: VehicleType;
  base_price: number;
  is_active: boolean;
}

const defaultZoneForm: ZoneForm = {
  zone_code: "",
  zone_name_en: "",
  zone_name_th: "",
  region: "bangkok",
  description: "",
  is_active: true,
};

const defaultPriceForm: PriceForm = {
  from_zone_id: "",
  to_zone_id: "",
  vehicle_type: "car",
  base_price: 0,
  is_active: true,
};

export const ZonesPricingManagement = () => {
  const [activeTab, setActiveTab] = useState("zones");
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editingPrice, setEditingPrice] = useState<ZonePrice | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneForm>(defaultZoneForm);
  const [priceForm, setPriceForm] = useState<PriceForm>(defaultPriceForm);
  const queryClient = useQueryClient();

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ["admin-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("region", { ascending: true })
        .order("zone_code", { ascending: true });
      if (error) throw error;
      return data as Zone[];
    },
  });

  const { data: zonePrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["admin-zone-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_prices")
        .select(`
          *,
          from_zone:zones!zone_prices_from_zone_id_fkey(*),
          to_zone:zones!zone_prices_to_zone_id_fkey(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ZonePrice[];
    },
  });

  // Zone mutations
  const createZoneMutation = useMutation({
    mutationFn: async (data: ZoneForm) => {
      const { error } = await supabase.from("zones").insert({
        zone_code: data.zone_code.toUpperCase(),
        zone_name_en: data.zone_name_en,
        zone_name_th: data.zone_name_th,
        region: data.region,
        description: data.description || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success("สร้างโซนสำเร็จ");
      handleCloseZoneDialog();
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ZoneForm }) => {
      const { error } = await supabase
        .from("zones")
        .update({
          zone_code: data.zone_code.toUpperCase(),
          zone_name_en: data.zone_name_en,
          zone_name_th: data.zone_name_th,
          region: data.region,
          description: data.description || null,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success("อัพเดทโซนสำเร็จ");
      handleCloseZoneDialog();
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success("ลบโซนสำเร็จ");
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  // Price mutations
  const createPriceMutation = useMutation({
    mutationFn: async (data: PriceForm) => {
      const { error } = await supabase.from("zone_prices").insert({
        from_zone_id: data.from_zone_id,
        to_zone_id: data.to_zone_id,
        vehicle_type: data.vehicle_type,
        base_price: data.base_price,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zone-prices"] });
      toast.success("สร้างราคาสำเร็จ");
      handleClosePriceDialog();
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PriceForm }) => {
      const { error } = await supabase
        .from("zone_prices")
        .update({
          from_zone_id: data.from_zone_id,
          to_zone_id: data.to_zone_id,
          vehicle_type: data.vehicle_type,
          base_price: data.base_price,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zone-prices"] });
      toast.success("อัพเดทราคาสำเร็จ");
      handleClosePriceDialog();
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const deletePriceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("zone_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zone-prices"] });
      toast.success("ลบราคาสำเร็จ");
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const handleCloseZoneDialog = () => {
    setIsZoneDialogOpen(false);
    setEditingZone(null);
    setZoneForm(defaultZoneForm);
  };

  const handleClosePriceDialog = () => {
    setIsPriceDialogOpen(false);
    setEditingPrice(null);
    setPriceForm(defaultPriceForm);
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setZoneForm({
      zone_code: zone.zone_code,
      zone_name_en: zone.zone_name_en,
      zone_name_th: zone.zone_name_th,
      region: zone.region,
      description: zone.description ?? "",
      is_active: zone.is_active ?? true,
    });
    setIsZoneDialogOpen(true);
  };

  const handleEditPrice = (price: ZonePrice) => {
    setEditingPrice(price);
    setPriceForm({
      from_zone_id: price.from_zone_id,
      to_zone_id: price.to_zone_id,
      vehicle_type: price.vehicle_type,
      base_price: price.base_price,
      is_active: price.is_active ?? true,
    });
    setIsPriceDialogOpen(true);
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data: zoneForm });
    } else {
      createZoneMutation.mutate(zoneForm);
    }
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrice) {
      updatePriceMutation.mutate({ id: editingPrice.id, data: priceForm });
    } else {
      createPriceMutation.mutate(priceForm);
    }
  };

  const vehicleTypeLabels: Record<VehicleType, string> = {
    car: "รถยนต์",
    van: "รถตู้",
    bus: "รถบัส",
  };

  const regionLabels: Record<string, string> = {
    bangkok: "กรุงเทพ",
    pattaya: "พัทยา",
    huahin: "หัวหิน",
    chiangmai: "เชียงใหม่",
    phuket: "ภูเก็ต",
    other: "อื่นๆ",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการโซนและราคา</h2>
          <p className="text-muted-foreground">กำหนดโซนพื้นที่และราคาสำหรับแต่ละเส้นทาง</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              โซนทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{zones?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              ราคาเส้นทาง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{zonePrices?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              โซนที่เปิดใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {zones?.filter((z) => z.is_active).length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="zones">โซนพื้นที่</TabsTrigger>
          <TabsTrigger value="prices">ราคาเส้นทาง</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setZoneForm(defaultZoneForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มโซน
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingZone ? "แก้ไขโซน" : "เพิ่มโซนใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleZoneSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>รหัสโซน</Label>
                      <Input
                        value={zoneForm.zone_code}
                        onChange={(e) => setZoneForm({ ...zoneForm, zone_code: e.target.value.toUpperCase() })}
                        placeholder="BKK-CITY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ภูมิภาค</Label>
                      <Select value={zoneForm.region} onValueChange={(v) => setZoneForm({ ...zoneForm, region: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(regionLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ชื่อโซน (อังกฤษ)</Label>
                      <Input
                        value={zoneForm.zone_name_en}
                        onChange={(e) => setZoneForm({ ...zoneForm, zone_name_en: e.target.value })}
                        placeholder="Bangkok City Center"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ชื่อโซน (ไทย)</Label>
                      <Input
                        value={zoneForm.zone_name_th}
                        onChange={(e) => setZoneForm({ ...zoneForm, zone_name_th: e.target.value })}
                        placeholder="ใจกลางกรุงเทพ"
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>รายละเอียด</Label>
                      <Input
                        value={zoneForm.description}
                        onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                        placeholder="คำอธิบายเพิ่มเติม..."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={zoneForm.is_active}
                          onCheckedChange={(checked) => setZoneForm({ ...zoneForm, is_active: checked })}
                        />
                        <Label>เปิดใช้งาน</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseZoneDialog}>
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={createZoneMutation.isPending || updateZoneMutation.isPending}>
                      {editingZone ? "บันทึก" : "สร้างโซน"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสโซน</TableHead>
                    <TableHead>ชื่อ (EN)</TableHead>
                    <TableHead>ชื่อ (TH)</TableHead>
                    <TableHead>ภูมิภาค</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zonesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        กำลังโหลด...
                      </TableCell>
                    </TableRow>
                  ) : zones?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ยังไม่มีโซน
                      </TableCell>
                    </TableRow>
                  ) : (
                    zones?.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell className="font-mono font-bold">{zone.zone_code}</TableCell>
                        <TableCell>{zone.zone_name_en}</TableCell>
                        <TableCell>{zone.zone_name_th}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{regionLabels[zone.region] ?? zone.region}</Badge>
                        </TableCell>
                        <TableCell>
                          {zone.is_active ? (
                            <Badge variant="default" className="bg-green-600">
                              เปิดใช้งาน
                            </Badge>
                          ) : (
                            <Badge variant="secondary">ปิดใช้งาน</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditZone(zone)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm("ต้องการลบโซนนี้?")) {
                                  deleteZoneMutation.mutate(zone.id);
                                }
                              }}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setPriceForm(defaultPriceForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มราคาเส้นทาง
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPrice ? "แก้ไขราคา" : "เพิ่มราคาใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePriceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>โซนต้นทาง</Label>
                      <Select
                        value={priceForm.from_zone_id}
                        onValueChange={(v) => setPriceForm({ ...priceForm, from_zone_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกโซน" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones?.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.zone_code} - {zone.zone_name_th}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>โซนปลายทาง</Label>
                      <Select
                        value={priceForm.to_zone_id}
                        onValueChange={(v) => setPriceForm({ ...priceForm, to_zone_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกโซน" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones?.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.zone_code} - {zone.zone_name_th}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ประเภทรถ</Label>
                      <Select
                        value={priceForm.vehicle_type}
                        onValueChange={(v: VehicleType) => setPriceForm({ ...priceForm, vehicle_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(vehicleTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ราคา (THB)</Label>
                      <Input
                        type="number"
                        value={priceForm.base_price}
                        onChange={(e) => setPriceForm({ ...priceForm, base_price: Number(e.target.value) })}
                        min={0}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={priceForm.is_active}
                          onCheckedChange={(checked) => setPriceForm({ ...priceForm, is_active: checked })}
                        />
                        <Label>เปิดใช้งาน</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClosePriceDialog}>
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={createPriceMutation.isPending || updatePriceMutation.isPending}>
                      {editingPrice ? "บันทึก" : "สร้างราคา"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ต้นทาง</TableHead>
                    <TableHead>ปลายทาง</TableHead>
                    <TableHead>ประเภทรถ</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        กำลังโหลด...
                      </TableCell>
                    </TableRow>
                  ) : zonePrices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ยังไม่มีราคาเส้นทาง
                      </TableCell>
                    </TableRow>
                  ) : (
                    zonePrices?.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>
                          <div className="font-medium">{price.from_zone?.zone_code}</div>
                          <div className="text-sm text-muted-foreground">{price.from_zone?.zone_name_th}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{price.to_zone?.zone_code}</div>
                          <div className="text-sm text-muted-foreground">{price.to_zone?.zone_name_th}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vehicleTypeLabels[price.vehicle_type]}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">฿{price.base_price.toLocaleString()}</TableCell>
                        <TableCell>
                          {price.is_active ? (
                            <Badge variant="default" className="bg-green-600">
                              เปิดใช้งาน
                            </Badge>
                          ) : (
                            <Badge variant="secondary">ปิดใช้งาน</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditPrice(price)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm("ต้องการลบราคานี้?")) {
                                  deletePriceMutation.mutate(price.id);
                                }
                              }}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
