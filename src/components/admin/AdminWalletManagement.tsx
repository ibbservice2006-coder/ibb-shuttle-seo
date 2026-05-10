import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Wallet, Search, Check, X, RefreshCw, Loader2, ArrowDownLeft, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_ref: string | null;
  notes: string | null;
  created_at: string;
  profile_id: string;
  booking_id: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    wallet_balance: number;
  };
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  wallet_balance: number;
  user_id: string;
}

export const AdminWalletManagement = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  
  // Approve/Reject dialog
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual adjustment dialog
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"deposit" | "refund" | "withdrawal">("deposit");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentDescription, setAdjustmentDescription] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchProfiles();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("payments")
        .select(`
          *,
          profiles (
            full_name,
            email,
            wallet_balance
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "pending" | "completed" | "failed" | "refunded");
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, wallet_balance, user_id")
        .order("full_name");
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      setIsProcessing(true);

      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "completed" as const,
          verified_at: new Date().toISOString(),
          notes: actionNotes || selectedPayment.notes,
        })
        .eq("id", selectedPayment.id);

      if (paymentError) throw paymentError;

      // If this payment is for a booking, update booking status to pending_assignment
      if (selectedPayment.booking_id) {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            status: "pending_assignment",
            deposit_paid: true,
          })
          .eq("id", selectedPayment.booking_id);

        if (bookingError) {
          console.error("Error updating booking status:", bookingError);
          // Don't throw - payment is already approved, just log the error
        }
      }

      // Only update wallet if this is a wallet deposit (has profile_id but no booking_id)
      if (selectedPayment.profile_id && !selectedPayment.booking_id) {
        // Use secure admin_wallet_adjustment function
        const { error: txError } = await supabase.rpc('admin_wallet_adjustment', {
          p_profile_id: selectedPayment.profile_id,
          p_amount: Number(selectedPayment.amount),
          p_transaction_type: 'deposit',
          p_description: `Deposit via ${selectedPayment.payment_method}`,
          p_reference_id: selectedPayment.transaction_ref,
        });

        if (txError) throw txError;

        toast({
          title: "Payment Approved",
          description: `฿${Number(selectedPayment.amount).toLocaleString()} has been added to the customer's wallet.`,
        });
      } else {
        toast({
          title: "Payment Approved",
          description: `Booking payment verified. Booking moved to pending assignment.`,
        });
      }

      setSelectedPayment(null);
      setActionType(null);
      setActionNotes("");
      fetchPayments();
      fetchProfiles();
    } catch (error: any) {
      console.error("Error approving payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from("payments")
        .update({
          status: "failed" as const,
          notes: actionNotes || "Rejected by admin",
        })
        .eq("id", selectedPayment.id);

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "The payment has been rejected.",
      });

      setSelectedPayment(null);
      setActionType(null);
      setActionNotes("");
      fetchPayments();
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdjustment = async () => {
    if (!selectedProfile || !adjustmentAmount) return;

    try {
      setIsProcessing(true);

      const amount = parseFloat(adjustmentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      // Use the secure admin_wallet_adjustment function
      const { data, error } = await supabase.rpc('admin_wallet_adjustment', {
        p_profile_id: selectedProfile,
        p_amount: amount,
        p_transaction_type: adjustmentType,
        p_description: adjustmentDescription || `Manual ${adjustmentType} by admin`,
        p_reference_id: null,
      });

      if (error) {
        // Check for insufficient balance error
        if (error.message?.includes("Insufficient wallet balance")) {
          toast({
            title: "Insufficient Balance",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        // Check for unauthorized error
        if (error.message?.includes("Unauthorized")) {
          toast({
            title: "Access Denied",
            description: "Only admins can perform wallet adjustments.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Adjustment Complete",
        description: `฿${amount.toLocaleString()} ${adjustmentType} has been processed.`,
      });

      setShowAdjustDialog(false);
      setSelectedProfile("");
      setAdjustmentAmount("");
      setAdjustmentDescription("");
      fetchProfiles();
    } catch (error: any) {
      console.error("Error processing adjustment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process adjustment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.profiles?.full_name?.toLowerCase().includes(search) ||
      payment.profiles?.email?.toLowerCase().includes(search) ||
      payment.transaction_ref?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer_thb: "Thai Bank Transfer",
      payoneer: "Payoneer",
      wise: "Wise",
      credit_card: "Credit Card",
      crypto: "Crypto",
      external_platform: "External Platform",
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Wallet Management
          </h2>
          <p className="text-muted-foreground">
            Manage customer payments and wallet balances
          </p>
        </div>
        <Button onClick={() => setShowAdjustDialog(true)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Manual Adjustment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or reference..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchPayments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>
            Review and process customer deposit requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.profiles?.full_name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{payment.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ฿{Number(payment.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_ref || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {payment.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setActionType("approve");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setActionType("reject");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedPayment && !!actionType} onOpenChange={() => {
        setSelectedPayment(null);
        setActionType(null);
        setActionNotes("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will add funds to the customer's wallet."
                : "This will reject the payment request."}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Customer:</div>
                  <div className="font-medium">{selectedPayment.profiles?.full_name}</div>
                  <div>Amount:</div>
                  <div className="font-medium">฿{Number(selectedPayment.amount).toLocaleString()}</div>
                  <div>Method:</div>
                  <div className="font-medium">{getPaymentMethodLabel(selectedPayment.payment_method)}</div>
                  <div>Reference:</div>
                  <div className="font-medium">{selectedPayment.transaction_ref || "-"}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder={actionType === "approve" ? "Optional notes..." : "Reason for rejection..."}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedPayment(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={actionType === "approve" ? handleApprovePayment : handleRejectPayment}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Wallet Adjustment</DialogTitle>
            <DialogDescription>
              Add funds or refund to a customer's wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email || "Unknown"} - ฿{Number(profile.wallet_balance).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "deposit" | "refund")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit (Add funds)</SelectItem>
                  <SelectItem value="refund">Refund (Add funds)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (THB)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Reason for adjustment..."
                value={adjustmentDescription}
                onChange={(e) => setAdjustmentDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualAdjustment}
              disabled={isProcessing || !selectedProfile || !adjustmentAmount}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Process Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
