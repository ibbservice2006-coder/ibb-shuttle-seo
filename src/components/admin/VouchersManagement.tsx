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
import { Plus, Pencil, Trash2, Ticket, DollarSign, ShoppingCart, CheckCircle, Package, XCircle } from "lucide-react";
import { format } from "date-fns";

type VoucherStatus = "available" | "sold" | "activated" | "redeemed" | "expired" | "cancelled";

interface Voucher {
  id: string;
  code: string;
  voucher_type: "ibb_internal" | "external_platform";
  voucher_value: number | null;
  remaining_value: number | null;
  voucher_status: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean | null;
  external_platform: string | null;
  sold_at: string | null;
  sold_platform: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  activated_at: string | null;
  redeemed_at: string | null;
  redeemed_booking_id: string | null;
  created_at: string;
}

interface VoucherForm {
  code: string;
  voucher_type: "ibb_internal" | "external_platform";
  voucher_value: number;
  voucher_status: VoucherStatus;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_uses: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  external_platform: string;
  sold_platform: string;
  buyer_name: string;
  buyer_email: string;
}

const defaultForm: VoucherForm = {
  code: "",
  voucher_type: "external_platform",
  voucher_value: 0,
  voucher_status: "available",
  discount_type: "fixed",
  discount_value: 0,
  max_discount_amount: null,
  min_order_amount: null,
  max_uses: 1,
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  is_active: true,
  external_platform: "",
  sold_platform: "",
  buyer_name: "",
  buyer_email: "",
};

const statusConfig: Record<VoucherStatus, { label: string; color: string; icon: React.ReactNode }> = {
  available: { label: "พร้อมขาย", color: "bg-blue-600", icon: <Package className="h-3 w-3" /> },
  sold: { label: "ขายแล้ว", color: "bg-yellow-600", icon: <ShoppingCart className="h-3 w-3" /> },
  activated: { label: "เปิดใช้งาน", color: "bg-green-600", icon: <CheckCircle className="h-3 w-3" /> },
  redeemed: { label: "ใช้แล้ว", color: "bg-purple-600", icon: <Ticket className="h-3 w-3" /> },
  expired: { label: "หมดอายุ", color: "bg-gray-600", icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: "ยกเลิก", color: "bg-red-600", icon: <XCircle className="h-3 w-3" /> },
};

const platformOptions = [
  { value: "amazon", label: "Amazon" },
  { value: "ebay", label: "eBay" },
  { value: "klook", label: "Klook" },
  { value: "viator", label: "Viator" },
  { value: "getyourguide", label: "GetYourGuide" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "other", label: "อื่นๆ" },
];

export const VouchersManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(defaultForm);
  const [activeTab, setActiveTab] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Voucher[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VoucherForm) => {
      const insertData = {
        code: data.code.toUpperCase(),
        voucher_type: data.voucher_type,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_discount_amount: data.max_discount_amount,
        min_order_amount: data.min_order_amount,
        max_uses: data.max_uses,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: data.is_active,
        external_platform: data.voucher_type === "external_platform" ? data.external_platform : null,
      };
      
      const { error } = await supabase.from("vouchers").insert(insertData);
      if (error) throw error;
      
      // Update the new fields separately since they're not in the types yet
      const { data: newVoucher } = await supabase
        .from("vouchers")
        .select("id")
        .eq("code", data.code.toUpperCase())
        .single();
      
      if (newVoucher) {
        await supabase.from("vouchers").update({
          voucher_value: data.voucher_value,
          remaining_value: data.voucher_value,
          voucher_status: data.voucher_status,
          sold_platform: data.sold_platform || null,
          buyer_name: data.buyer_name || null,
          buyer_email: data.buyer_email || null,
        } as Record<string, unknown>).eq("id", newVoucher.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("สร้าง Voucher สำเร็จ");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VoucherForm }) => {
      const updateData: Record<string, unknown> = {
        code: data.code.toUpperCase(),
        voucher_type: data.voucher_type,
        voucher_value: data.voucher_value,
        voucher_status: data.voucher_status,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_discount_amount: data.max_discount_amount,
        min_order_amount: data.min_order_amount,
        max_uses: data.max_uses,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: data.is_active,
        external_platform: data.voucher_type === "external_platform" ? data.external_platform : null,
        sold_platform: data.sold_platform || null,
        buyer_name: data.buyer_name || null,
        buyer_email: data.buyer_email || null,
      };

      // Set timestamps based on status changes
      if (data.voucher_status === "sold" && !editingVoucher?.sold_at) {
        updateData.sold_at = new Date().toISOString();
      }
      if (data.voucher_status === "activated" && !editingVoucher?.activated_at) {
        updateData.activated_at = new Date().toISOString();
      }
      if (data.voucher_status === "redeemed" && !editingVoucher?.redeemed_at) {
        updateData.redeemed_at = new Date().toISOString();
        updateData.remaining_value = 0;
      }

      const { error } = await supabase
        .from("vouchers")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("อัพเดท Voucher สำเร็จ");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vouchers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("ลบ Voucher สำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVoucher(null);
    setForm(defaultForm);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      voucher_type: voucher.voucher_type,
      voucher_value: voucher.voucher_value ?? 0,
      voucher_status: (voucher.voucher_status as VoucherStatus) ?? "available",
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      max_discount_amount: voucher.max_discount_amount,
      min_order_amount: voucher.min_order_amount,
      max_uses: voucher.max_uses,
      valid_from: voucher.valid_from.split("T")[0],
      valid_until: voucher.valid_until.split("T")[0],
      is_active: voucher.is_active ?? true,
      external_platform: voucher.external_platform ?? "",
      sold_platform: voucher.sold_platform ?? "",
      buyer_name: voucher.buyer_name ?? "",
      buyer_email: voucher.buyer_email ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "IBB-";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const isVoucherExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getVoucherStatus = (voucher: Voucher): VoucherStatus => {
    if (isVoucherExpired(voucher.valid_until) && voucher.voucher_status !== "redeemed") {
      return "expired";
    }
    return (voucher.voucher_status as VoucherStatus) ?? "available";
  };

  const filteredVouchers = vouchers?.filter((v) => {
    if (activeTab === "all") return true;
    const status = getVoucherStatus(v);
    return status === activeTab;
  });

  const getStatusCounts = () => {
    if (!vouchers) return { available: 0, sold: 0, activated: 0, redeemed: 0, expired: 0, cancelled: 0 };
    
    return vouchers.reduce((acc, v) => {
      const status = getVoucherStatus(v);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<VoucherStatus, number>);
  };

  const statusCounts = getStatusCounts();
  const totalValue = vouchers?.reduce((sum, v) => sum + (v.voucher_value ?? 0), 0) ?? 0;
  const soldValue = vouchers?.filter(v => ["sold", "activated", "redeemed"].includes(getVoucherStatus(v)))
    .reduce((sum, v) => sum + (v.voucher_value ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการ Prepaid Vouchers</h2>
          <p className="text-muted-foreground">สร้างและจัดการ Voucher สำหรับขายบน Online Platforms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="h-4 w-4 mr-2" />
              สร้าง Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? "แก้ไข Voucher" : "สร้าง Voucher ใหม่"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Voucher Code */}
                <div className="space-y-2">
                  <Label>รหัส Voucher</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="IBB-XXXXXXXX"
                      required
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateVoucherCode}>
                      สุ่ม
                    </Button>
                  </div>
                </div>

                {/* Voucher Value */}
                <div className="space-y-2">
                  <Label>มูลค่า Voucher (THB)</Label>
                  <Input
                    type="number"
                    value={form.voucher_value}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setForm({ ...form, voucher_value: value, discount_value: value });
                    }}
                    min={0}
                    required
                  />
                </div>

                {/* Voucher Type */}
                <div className="space-y-2">
                  <Label>ประเภท</Label>
                  <Select
                    value={form.voucher_type}
                    onValueChange={(value: "ibb_internal" | "external_platform") =>
                      setForm({ ...form, voucher_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external_platform">ขายบน Platform</SelectItem>
                      <SelectItem value="ibb_internal">IBB Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select
                    value={form.voucher_status}
                    onValueChange={(value: VoucherStatus) =>
                      setForm({ ...form, voucher_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sold Platform */}
                {form.voucher_type === "external_platform" && (
                  <div className="space-y-2">
                    <Label>Platform ที่ขาย</Label>
                    <Select
                      value={form.external_platform}
                      onValueChange={(value) => setForm({ ...form, external_platform: value, sold_platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Valid Dates */}
                <div className="space-y-2">
                  <Label>วันเริ่มต้น</Label>
                  <Input
                    type="date"
                    value={form.valid_from}
                    onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>วันหมดอายุ</Label>
                  <Input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    required
                  />
                </div>

                {/* Buyer Info (show when sold) */}
                {["sold", "activated", "redeemed"].includes(form.voucher_status) && (
                  <>
                    <div className="space-y-2">
                      <Label>ชื่อผู้ซื้อ</Label>
                      <Input
                        value={form.buyer_name}
                        onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                        placeholder="ชื่อผู้ซื้อ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>อีเมลผู้ซื้อ</Label>
                      <Input
                        type="email"
                        value={form.buyer_email}
                        onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </>
                )}

                {/* Active Toggle */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label>เปิดใช้งาน</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingVoucher ? "บันทึก" : "สร้าง Voucher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Voucher ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              มูลค่ารวม ฿{totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              พร้อมขาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.available || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-yellow-500" />
              ขายแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(statusCounts.sold || 0) + (statusCounts.activated || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              มูลค่า ฿{soldValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              ใช้แล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.redeemed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table with Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 pt-4">
              <TabsList>
                <TabsTrigger value="all">ทั้งหมด ({vouchers?.length ?? 0})</TabsTrigger>
                <TabsTrigger value="available">พร้อมขาย ({statusCounts.available || 0})</TabsTrigger>
                <TabsTrigger value="sold">ขายแล้ว ({statusCounts.sold || 0})</TabsTrigger>
                <TabsTrigger value="activated">เปิดใช้งาน ({statusCounts.activated || 0})</TabsTrigger>
                <TabsTrigger value="redeemed">ใช้แล้ว ({statusCounts.redeemed || 0})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส Voucher</TableHead>
                    <TableHead>มูลค่า</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>ผู้ซื้อ</TableHead>
                    <TableHead>วันหมดอายุ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        กำลังโหลด...
                      </TableCell>
                    </TableRow>
                  ) : filteredVouchers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        ไม่มี Voucher
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVouchers?.map((voucher) => {
                      const status = getVoucherStatus(voucher);
                      const config = statusConfig[status];
                      return (
                        <TableRow key={voucher.id}>
                          <TableCell className="font-mono font-bold">{voucher.code}</TableCell>
                          <TableCell>
                            <div className="font-semibold">฿{(voucher.voucher_value ?? 0).toLocaleString()}</div>
                            {voucher.remaining_value !== voucher.voucher_value && voucher.remaining_value !== null && (
                              <span className="text-xs text-muted-foreground">
                                เหลือ ฿{voucher.remaining_value.toLocaleString()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {voucher.external_platform || voucher.voucher_type === "ibb_internal" ? "IBB" : "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {voucher.buyer_name ? (
                              <div>
                                <div className="font-medium">{voucher.buyer_name}</div>
                                <div className="text-xs text-muted-foreground">{voucher.buyer_email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>{format(new Date(voucher.valid_until), "dd/MM/yyyy")}</div>
                            {voucher.sold_at && (
                              <div className="text-xs text-muted-foreground">
                                ขาย: {format(new Date(voucher.sold_at), "dd/MM/yy")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} text-white`}>
                              <span className="flex items-center gap-1">
                                {config.icon}
                                {config.label}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(voucher)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm("ต้องการลบ Voucher นี้?")) {
                                    deleteMutation.mutate(voucher.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
