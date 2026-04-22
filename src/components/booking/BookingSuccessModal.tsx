import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, CreditCard, Building2, Globe, Bitcoin, Wallet, Banknote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type VehicleType = "car" | "van" | "bus";

interface BookingSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingNumber: string;
  amount: number;
  currency: string;
  guestEmail: string;
  vehicleType?: VehicleType;
}

const paymentOptions = [
  { icon: Banknote, name: "Cash to Driver", id: "cash" },
  { icon: Building2, name: "Bank Transfer", id: "bank" },
  { icon: Globe, name: "Wise / Payoneer", id: "wise" },
  { icon: CreditCard, name: "Credit Card", id: "card" },
  { icon: Bitcoin, name: "Crypto", id: "crypto" },
  { icon: Wallet, name: "Other", id: "other" },
];

const BookingSuccessModal = ({
  open,
  onOpenChange,
  bookingNumber,
  amount,
  currency,
  guestEmail,
  vehicleType = "car",
}: BookingSuccessModalProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Booking number copied to clipboard.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-2xl">
            Booking Confirmed!
          </DialogTitle>
          <DialogDescription>
            Your booking has been received successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Number */}
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Booking Number
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono font-bold text-primary">
                {bookingNumber}
              </span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Please save this number for your records
            </p>
          </div>

          {/* Amount */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">
              Amount to Pay
            </p>
            <p className="text-2xl font-bold text-primary">
              {currency} {amount.toLocaleString()}
            </p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">
              Available Payment Methods
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedPayment(option.id)}
                  className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all cursor-pointer ${
                    selectedPayment === option.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted"
                  } ${option.id === "cash" && !selectedPayment ? "border-amber-500/50 bg-amber-500/5" : ""}`}
                >
                  <option.icon className={`h-5 w-5 mb-1 ${
                    selectedPayment === option.id ? "text-primary" : option.id === "cash" ? "text-amber-600" : "text-muted-foreground"
                  }`} />
                  <span className={`text-[10px] text-center leading-tight ${
                    selectedPayment === option.id ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Notice */}
          <p className="text-sm text-muted-foreground text-center">
            Booking details sent to: <span className="font-medium">{guestEmail}</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              asChild 
              className="w-full" 
              disabled={!selectedPayment}
            >
              <Link to={`/guest-payment?booking=${bookingNumber}&email=${encodeURIComponent(guestEmail)}&vehicle=${vehicleType}&method=${selectedPayment || ''}`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Link>
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              I'll Pay Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSuccessModal;