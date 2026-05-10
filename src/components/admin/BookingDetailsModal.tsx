import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/ibb/client";
import { Tables } from "@/integrations/ibb/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Car,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  Banknote,
  FileText,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Truck,
} from "lucide-react";
import {
  BookingStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  ALLOWED_TRANSITIONS,
  STATUS_AUTHORITY,
} from "@/lib/bookingStatusFlow";

type Booking = Tables<"bookings">;
type Payment = Tables<"payments">;

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  is_active: boolean | null;
}

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  vehicle_type: string;
  capacity: number;
  is_active: boolean | null;
  is_vip: boolean | null;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: () => void;
}

const BookingDetailsModal = ({
  booking,
  open,
  onOpenChange,
  onStatusUpdated,
}: BookingDetailsModalProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<BookingStatus | null>(null);
  
  // Driver/Vehicle assignment
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (booking && open) {
      fetchPayments();
      fetchDriversAndVehicles();
      setAdminNotes(booking.admin_notes || "");
      setSelectedDriverId(booking.assigned_driver_id || "");
      setSelectedVehicleId(booking.assigned_vehicle_id || "");
    }
  }, [booking, open]);

  const fetchPayments = async () => {
    if (!booking) return;
    setLoadingPayments(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setLoadingPayments(false);
  };

  const fetchDriversAndVehicles = async () => {
    const [driversRes, vehiclesRes] = await Promise.all([
      supabase.from("drivers").select("id, full_name, phone, is_active").eq("is_active", true).order("full_name"),
      supabase.from("vehicles").select("id, license_plate, brand, model, vehicle_type, capacity, is_active, is_vip").eq("is_active", true).order("license_plate"),
    ]);
    if (driversRes.data) setDrivers(driversRes.data);
    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
  };

  const handleAssign = async () => {
    if (!booking) return;
    setIsAssigning(true);

    const updateData: Record<string, unknown> = {};
    let statusUpdate = false;

    if (selectedDriverId && selectedDriverId !== booking.assigned_driver_id) {
      updateData.assigned_driver_id = selectedDriverId;
    }
    if (selectedVehicleId && selectedVehicleId !== booking.assigned_vehicle_id) {
      updateData.assigned_vehicle_id = selectedVehicleId;
    }

    // Auto-transition to "assigned" if both driver and vehicle are set
    if (selectedDriverId && selectedVehicleId && 
        ["pending_assignment", "confirmed"].includes(booking.status)) {
      updateData.status = "assigned";
      statusUpdate = true;
    }

    if (Object.keys(updateData).length === 0) {
      setIsAssigning(false);
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    setIsAssigning(false);

    if (error) {
      toast({
        title: "Error assigning",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Assignment updated",
        description: statusUpdate 
          ? "Driver & vehicle assigned. Booking moved to 'Assigned'." 
          : "Assignment updated successfully.",
      });
      onStatusUpdated();
      onOpenChange(false);
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!booking) return;

    setUpdatingStatus(newStatus);

    const updateData: Record<string, unknown> = { 
      status: newStatus,
      admin_notes: adminNotes,
    };

    if (newStatus === "confirmed") {
      updateData.confirmed_at = new Date().toISOString();
    } else if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else if (newStatus === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    setUpdatingStatus(null);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Booking changed to ${STATUS_LABELS[newStatus]}`,
      });
      onStatusUpdated();
      onOpenChange(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!booking) return;

    const { error } = await supabase
      .from("bookings")
      .update({ admin_notes: adminNotes })
      .eq("id", booking.id);

    if (error) {
      toast({
        title: "Error saving notes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Notes saved" });
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "wallet":
        return <Wallet className="h-4 w-4" />;
      case "bank_transfer_thb":
        return <Banknote className="h-4 w-4" />;
      case "cash_to_driver":
        return <Banknote className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-700">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-purple-500/20 text-purple-700">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransitionReasons = (status: BookingStatus): Record<BookingStatus, string | null> => {
    const reasons: Record<BookingStatus, string | null> = {
      pending_payment: null,
      pending: null,
      pending_assignment: null,
      confirmed: null,
      assigned: null,
      in_progress: null,
      completed: null,
      cancelled: null,
    };

    if (!booking) return reasons;

    const currentStatus = booking.status as BookingStatus;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (allowedNext.includes("pending_assignment")) {
      const hasPendingPayment = payments.some((p) => p.status === "pending");
      const hasCompletedPayment = payments.some((p) => p.status === "completed");
      if (!hasCompletedPayment && !hasPendingPayment) {
        reasons.pending_assignment = "No payment record found";
      }
    }

    return reasons;
  };

  if (!booking) return null;

  const currentStatus = booking.status as BookingStatus;
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  const transitionReasons = getTransitionReasons(currentStatus);
  const isGuestBooking = !booking.customer_id;
  const canAssign = ["pending_assignment", "confirmed", "assigned"].includes(currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Booking Details
            </DialogTitle>
            <Badge className={STATUS_COLORS[currentStatus]}>
              {STATUS_LABELS[currentStatus]}
            </Badge>
          </div>
          <DialogDescription className="font-mono text-lg">
            {booking.booking_number}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Route & Guest Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Route
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="font-medium">{booking.pickup_location}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Drop-off</p>
                  <p className="font-medium">{booking.dropoff_location}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </h3>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">
                  {format(new Date(booking.pickup_datetime), "EEEE, MMMM do, yyyy")}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(booking.pickup_datetime), "HH:mm")}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                {isGuestBooking ? "Guest" : "Customer"}
                {isGuestBooking && (
                  <Badge variant="outline" className="text-xs">Guest</Badge>
                )}
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="font-medium">{booking.guest_name || "N/A"}</p>
                {booking.guest_email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {booking.guest_email}
                  </p>
                )}
                {booking.guest_phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {booking.guest_phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle
              </h3>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium capitalize">{booking.vehicle_type}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.passenger_count} passenger{booking.passenger_count > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Status */}
          <div className="space-y-4">
            {/* Price Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Price Summary
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">
                    {booking.currency} {booking.final_price.toLocaleString()}
                  </span>
                </div>
                {booking.discount_amount && booking.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -{booking.currency} {booking.discount_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.deposit_amount && booking.deposit_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Deposit {booking.deposit_paid ? "(Paid)" : "(Due)"}
                    </span>
                    <span className={booking.deposit_paid ? "text-green-600" : "text-orange-600"}>
                      {booking.currency} {booking.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.cash_to_driver_amount && booking.cash_to_driver_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash to Driver</span>
                    <span>
                      {booking.currency} {booking.cash_to_driver_amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Driver & Vehicle Assignment */}
            {canAssign && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assign Driver & Vehicle
                </h3>
                <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Driver</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.full_name} ({d.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vehicle</Label>
                    <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles
                          .filter((v) => v.vehicle_type === booking.vehicle_type || !booking.vehicle_type)
                          .map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              <div className="flex items-center gap-2">
                                <Truck className="h-3 w-3" />
                                {v.license_plate} - {v.brand} {v.model} ({v.capacity}p)
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAssign}
                    disabled={isAssigning || (!selectedDriverId && !selectedVehicleId)}
                    className="w-full"
                  >
                    {isAssigning ? "Assigning..." : "Assign & Update"}
                  </Button>
                </div>
              </div>
            )}

            {/* Current Assignment (read-only for non-assignable statuses) */}
            {!canAssign && (booking.assigned_driver_id || booking.assigned_vehicle_id) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assignment
                </h3>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
                  {booking.assigned_driver_id && (
                    <p>
                      <span className="text-muted-foreground">Driver:</span>{" "}
                      {drivers.find((d) => d.id === booking.assigned_driver_id)?.full_name || booking.assigned_driver_id}
                    </p>
                  )}
                  {booking.assigned_vehicle_id && (
                    <p>
                      <span className="text-muted-foreground">Vehicle:</span>{" "}
                      {vehicles.find((v) => v.id === booking.assigned_vehicle_id)?.license_plate || booking.assigned_vehicle_id}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Records */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Payment Records
              </h3>
              <div className="p-3 rounded-lg bg-muted/50">
                {loadingPayments ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payment records</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {payment.payment_method.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), "MMM dd, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </p>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(booking.created_at), "MMM dd, HH:mm")}</span>
                </div>
                {booking.confirmed_at && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirmed:</span>
                    <span>{format(new Date(booking.confirmed_at), "MMM dd, HH:mm")}</span>
                  </div>
                )}
                {booking.completed_at && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed:</span>
                    <span>{format(new Date(booking.completed_at), "MMM dd, HH:mm")}</span>
                  </div>
                )}
                {booking.cancelled_at && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>Cancelled:</span>
                    <span>{format(new Date(booking.cancelled_at), "MMM dd, HH:mm")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Admin Notes */}
        <div className="py-4">
          <Label htmlFor="adminNotes" className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            Admin Notes (Internal)
          </Label>
          <Textarea
            id="adminNotes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this booking..."
            rows={2}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={saveAdminNotes}
            className="mt-2"
          >
            Save Notes
          </Button>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Status Actions</h3>
          
          {allowedNext.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This booking is in a terminal state ({STATUS_LABELS[currentStatus]}).
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allowedNext.map((nextStatus) => {
                const reason = transitionReasons[nextStatus];
                const isDisabled = !!reason || !!updatingStatus;
                const isLoading = updatingStatus === nextStatus;

                return (
                  <div key={nextStatus} className="relative group">
                    <Button
                      variant={nextStatus === "cancelled" ? "destructive" : "default"}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => handleStatusChange(nextStatus)}
                    >
                      {isLoading ? (
                        "Updating..."
                      ) : (
                        <>
                          {nextStatus === "cancelled" ? (
                            <XCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mr-1" />
                          )}
                          {STATUS_LABELS[nextStatus]}
                        </>
                      )}
                    </Button>
                    
                    {reason && (
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50">
                        <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg border max-w-xs">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {reason}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Authority: {STATUS_AUTHORITY[currentStatus]} controls this status
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
