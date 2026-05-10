import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/ibb/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Send, Bell, Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/ibb/types";

type NotificationChannel = Database["public"]["Enums"]["notification_channel"];

interface NotificationFormData {
  profile_id: string;
  booking_id: string;
  channel: NotificationChannel;
  title: string;
  message: string;
}

export const NotificationsManagement = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    profile_id: "",
    booking_id: "",
    channel: "email",
    title: "",
    message: "",
  });

  // Fetch notifications with profile and booking info
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          profiles:profile_id (full_name, email),
          bookings:booking_id (booking_number)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles for dropdown
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch bookings for dropdown
  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_number")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const createNotification = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const insertData: {
        channel: NotificationChannel;
        title: string;
        message: string;
        profile_id?: string;
        booking_id?: string;
      } = {
        channel: data.channel,
        title: data.title,
        message: data.message,
      };
      
      if (data.profile_id) insertData.profile_id = data.profile_id;
      if (data.booking_id) insertData.booking_id = data.booking_id;

      const { error } = await supabase.from("notifications").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("สร้างการแจ้งเตือนสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const markAsSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("อัพเดทสถานะเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const sendEmailNotification = useMutation({
    mutationFn: async (notification: {
      id: string;
      title: string;
      message: string;
      profile_id: string | null;
      booking_id: string | null;
      profiles: { full_name?: string; email?: string } | null;
      bookings: { booking_number?: string } | null;
    }) => {
      const email = notification.profiles?.email;
      if (!email) {
        throw new Error("ผู้รับไม่มีอีเมล");
      }

      const bookingNumber = notification.bookings?.booking_number;

      const response = await supabase.functions.invoke("send-notification", {
        body: {
          notification_id: notification.id,
          email: email,
          subject: notification.title,
          title: notification.title,
          message: notification.message,
          ...(bookingNumber && { booking_number: bookingNumber }),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "ส่งอีเมลไม่สำเร็จ");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("ส่งอีเมลสำเร็จ!");
    },
    onError: (error) => {
      toast.error("ส่งอีเมลไม่สำเร็จ: " + error.message);
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("ลบการแจ้งเตือนสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      profile_id: "",
      booking_id: "",
      channel: "email",
      title: "",
      message: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNotification.mutate(formData);
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Phone className="h-4 w-4" />;
      case "line":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: NotificationChannel) => {
    switch (channel) {
      case "email":
        return "bg-blue-500/10 text-blue-500";
      case "sms":
        return "bg-green-500/10 text-green-500";
      case "line":
        return "bg-emerald-500/10 text-emerald-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-montserrat">Notifications Management</h2>
          <p className="text-muted-foreground">จัดการการแจ้งเตือนผู้ใช้</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างการแจ้งเตือน
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>สร้างการแจ้งเตือนใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>ช่องทาง</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value: NotificationChannel) =>
                    setFormData({ ...formData, channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="line">LINE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ผู้รับ (ถ้ามี)</Label>
                <Select
                  value={formData.profile_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, profile_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกผู้ใช้" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ไม่ระบุ</SelectItem>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || profile.email || "ไม่ระบุชื่อ"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>การจอง (ถ้ามี)</Label>
                <Select
                  value={formData.booking_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, booking_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกการจอง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ไม่ระบุ</SelectItem>
                    {bookings?.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.booking_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">หัวข้อ *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">ข้อความ *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={createNotification.isPending}>
                  {createNotification.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  สร้าง
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ส่งแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notifications?.filter((n) => n.sent_at).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รอส่ง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {notifications?.filter((n) => !n.sent_at).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              อ่านแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {notifications?.filter((n) => n.is_read).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ช่องทาง</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>ผู้รับ</TableHead>
                <TableHead>การจอง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications?.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <Badge className={getChannelColor(notification.channel)}>
                      <span className="flex items-center gap-1">
                        {getChannelIcon(notification.channel)}
                        {notification.channel.toUpperCase()}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(notification.profiles as { full_name?: string; email?: string })?.full_name ||
                      (notification.profiles as { full_name?: string; email?: string })?.email ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    {(notification.bookings as { booking_number?: string })?.booking_number || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {notification.sent_at ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          ส่งแล้ว
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                          รอส่ง
                        </Badge>
                      )}
                      {notification.is_read && (
                        <Badge variant="outline" className="text-xs">
                          อ่านแล้ว
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!notification.sent_at && notification.channel === "email" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => sendEmailNotification.mutate({
                            id: notification.id,
                            title: notification.title,
                            message: notification.message,
                            profile_id: notification.profile_id,
                            booking_id: notification.booking_id,
                            profiles: notification.profiles as { full_name?: string; email?: string } | null,
                            bookings: notification.bookings as { booking_number?: string } | null,
                          })}
                          disabled={sendEmailNotification.isPending || !notification.profiles}
                          title={!notification.profiles ? "ต้องเลือกผู้รับที่มีอีเมล" : "ส่งอีเมลจริง"}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          ส่ง Email
                        </Button>
                      )}
                      {!notification.sent_at && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsSent.mutate(notification.id)}
                          disabled={markAsSent.isPending}
                          title="ทำเครื่องหมายว่าส่งแล้ว"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteNotification.mutate(notification.id)}
                        disabled={deleteNotification.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!notifications || notifications.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบการแจ้งเตือน
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
