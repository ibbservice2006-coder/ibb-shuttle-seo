import { useState } from "react";
import { Building2, Globe, CreditCard, Bitcoin, ShoppingBag, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/ibb/client";
import { useAuth } from "@/contexts/AuthContext";

interface DepositFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string | null;
  onSuccess?: () => void;
}

type PaymentMethod = "bank_transfer_thb" | "payoneer" | "wise" | "credit_card" | "crypto" | "external_platform";

const paymentMethods = [
  {
    id: "bank_transfer_thb" as PaymentMethod,
    name: "Thai Bank Transfer",
    description: "Transfer to our Thai bank account",
    icon: Building2,
    currencies: ["THB"],
    details: "Kasikorn Bank: 123-4-56789-0\nAccount Name: IBB Shuttle Co., Ltd.",
  },
  {
    id: "payoneer" as PaymentMethod,
    name: "Payoneer",
    description: "International payments",
    icon: Globe,
    currencies: ["USD", "EUR", "GBP"],
    details: "Email: payments@ibbshuttle.com",
  },
  {
    id: "wise" as PaymentMethod,
    name: "Wise",
    description: "International bank transfer",
    icon: Globe,
    currencies: ["USD", "EUR", "GBP", "JPY", "CNY"],
    details: "Email: payments@ibbshuttle.com",
  },
  {
    id: "credit_card" as PaymentMethod,
    name: "Credit Card",
    description: "Via Stripe / Omise",
    icon: CreditCard,
    currencies: ["THB", "USD"],
    details: "Secure payment processing",
  },
  {
    id: "crypto" as PaymentMethod,
    name: "Crypto (VVIP Only)",
    description: "USDT, BTC, ETH, BNB",
    icon: Bitcoin,
    currencies: ["USDT", "BTC", "ETH", "BNB"],
    details: "Contact us for wallet addresses",
    vvipOnly: true,
  },
  {
    id: "external_platform" as PaymentMethod,
    name: "External Platform",
    description: "Shopee, Lazada, Amazon",
    icon: ShoppingBag,
    currencies: ["THB"],
    details: "Provide your order reference",
  },
];

export const DepositForm = ({ open, onOpenChange, profileId, onSuccess }: DepositFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer_thb");
  const [amount, setAmount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileId || !user) {
      toast({
        title: "Error",
        description: "Please sign in to make a deposit",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create payment record (pending approval by admin)
      const { error } = await supabase.from("payments").insert({
        profile_id: profileId,
        amount: amountNum,
        payment_method: selectedMethod,
        transaction_ref: transactionRef || null,
        notes: notes || null,
        status: "pending",
        currency: "THB",
      });

      if (error) throw error;

      toast({
        title: "Deposit Submitted",
        description: "Your deposit request has been submitted. An admin will verify it shortly.",
      });

      // Reset form
      setAmount("");
      setTransactionRef("");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting deposit:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit deposit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Choose a payment method and submit your deposit details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup
              value={selectedMethod}
              onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {paymentMethods.map((method) => (
                <div key={method.id}>
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    className="peer sr-only"
                    disabled={method.vvipOnly}
                  />
                  <Label
                    htmlFor={method.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                      hover:bg-accent/50 ${method.vvipOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <method.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Details */}
          {selectedPayment && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Payment Details</h4>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedPayment.details}
              </pre>
              <div className="mt-2 text-xs text-muted-foreground">
                Accepted currencies: {selectedPayment.currencies.join(", ")}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (THB)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
          </div>

          {/* Transaction Reference */}
          <div className="space-y-2">
            <Label htmlFor="ref">Transaction Reference / Slip Number</Label>
            <Input
              id="ref"
              placeholder="e.g., Transfer slip number, Order ID"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Submit Deposit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
