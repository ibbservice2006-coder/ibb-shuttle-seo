import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Search,
  RefreshCw,
  Eye,
  MoreHorizontal,
  CalendarIcon,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  BookingStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  ALLOWED_TRANSITIONS,
} from "@/lib/bookingStatusFlow";
import BookingDetailsModal from "./BookingDetailsModal";

type Booking = Tables<"bookings">;

const ITEMS_PER_PAGE = 15;

const ALL_STATUSES: BookingStatus[] = [
  "pending_payment",
  "pending",
  "pending_assignment",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
];

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter logic
  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.booking_number.toLowerCase().includes(term) ||
          b.guest_name?.toLowerCase().includes(term) ||
          b.guest_email?.toLowerCase().includes(term) ||
          b.pickup_location.toLowerCase().includes(term) ||
          b.dropoff_location.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(
        (b) => new Date(b.pickup_datetime) >= dateFrom
      );
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(
        (b) => new Date(b.pickup_datetime) <= endOfDay
      );
    }

    return result;
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = bookings.filter(
      (b) => new Date(b.created_at) >= today
    );
    const activeBookings = bookings.filter((b) =>
      ["pending_payment", "pending", "pending_assignment", "confirmed", "assigned", "in_progress"].includes(b.status)
    );
    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + Number(b.final_price), 0);
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

    return {
      today: todayBookings.length,
      active: activeBookings.length,
      revenue: totalRevenue,
      cancelled: cancelledCount,
    };
  }, [bookings]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleQuickStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    setUpdatingStatusId(booking.id);
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "confirmed") updateData.confirmed_at = new Date().toISOString();
    if (newStatus === "completed") updateData.completed_at = new Date().toISOString();
    if (newStatus === "cancelled") updateData.cancelled_at = new Date().toISOString();

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    setUpdatingStatusId(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `→ ${STATUS_LABELS[newStatus]}` });
      fetchBookings();
    }
  };

  const handlePrintInvoice = (booking: Booking) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;
    invoiceWindow.document.write(`
      <html><head><title>Invoice - ${booking.booking_number}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { color: #b8860b; } table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { padding: 8px 12px; border-bottom: 1px solid #eee; text-align: left; }
        .total { font-size: 1.2em; font-weight: bold; }
        .header { display: flex; justify-content: space-between; align-items: center; }
      </style></head><body>
      <div class="header"><h1>IBB Transfer</h1><span>Invoice</span></div>
      <p><strong>Booking:</strong> ${booking.booking_number}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.pickup_datetime), "PPP HH:mm")}</p>
      <p><strong>Guest:</strong> ${booking.guest_name || "N/A"}</p>
      <table>
        <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Transfer: ${booking.pickup_location} → ${booking.dropoff_location}</td>
            <td style="text-align:right">${booking.currency} ${Number(booking.total_price).toLocaleString()}</td></tr>
        ${booking.discount_amount && Number(booking.discount_amount) > 0 ? `<tr><td>Discount</td><td style="text-align:right; color: green;">-${booking.currency} ${Number(booking.discount_amount).toLocaleString()}</td></tr>` : ""}
        <tr class="total"><td><strong>Total</strong></td>
            <td style="text-align:right"><strong>${booking.currency} ${Number(booking.final_price).toLocaleString()}</strong></td></tr>
      </table>
      <p style="margin-top:30px; color:#666; font-size:0.85em;">Vehicle: ${booking.vehicle_type} · Passengers: ${booking.passenger_count} · Status: ${STATUS_LABELS[booking.status as BookingStatus] || booking.status}</p>
      </body></html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-montserrat text-foreground">
          Bookings Management
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredBookings.length} of {bookings.length} bookings
          </Badge>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-xl font-bold">{stats.today}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Car className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">฿{stats.revenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-xl font-bold">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search booking #, name, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", STATUS_COLORS[s].split(" ")[0])} />
                  {STATUS_LABELS[s]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateFrom ? format(dateFrom, "MMM dd") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateTo ? format(dateTo, "MMM dd") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading bookings...</p>
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {hasActiveFilters ? "No bookings match your filters" : "No bookings found"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => {
                const currentStatus = booking.status as BookingStatus;
                const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

                return (
                  <TableRow key={booking.id} className="group">
                    <TableCell className="font-mono font-medium text-sm">
                      {booking.booking_number}
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[120px]">
                        <p className="font-medium text-sm">{booking.guest_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {booking.guest_email || booking.guest_phone || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[150px]">
                        <p className="text-sm truncate max-w-[180px]">{booking.pickup_location}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">→ {booking.dropoff_location}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(booking.pickup_datetime), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{booking.vehicle_type}</TableCell>
                    <TableCell className="text-right font-medium text-sm whitespace-nowrap">
                      {booking.currency} {Number(booking.final_price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(STATUS_COLORS[currentStatus], "text-xs whitespace-nowrap")}>
                        {STATUS_LABELS[currentStatus] || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updatingStatusId === booking.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintInvoice(booking)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Print Invoice
                          </DropdownMenuItem>
                          {allowedNext.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              {allowedNext.map((nextStatus) => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleQuickStatusChange(booking, nextStatus)}
                                >
                                  <ArrowUpDown className="h-4 w-4 mr-2" />
                                  → {STATUS_LABELS[nextStatus]}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of{" "}
            {filteredBookings.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <BookingDetailsModal
        booking={selectedBooking}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusUpdated={() => fetchBookings()}
      />
    </div>
  );
};
