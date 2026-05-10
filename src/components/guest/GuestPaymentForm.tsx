import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Building2, 
  CreditCard, 
  Globe, 
  Copy,
  CheckCircle2,
  Upload,
  X,
  Banknote
} from "lucide-react";
import { supabase } from "@/integrations/ibb/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import CashToDriverOption, { DEPOSIT_RATES } from "./CashToDriverOption";

type PaymentMethod = "bank_transfer_thb" | "wise" | "credit_card" | "cash_to_driver";

interface BookingData {
  id: string;
  booking_number: string;
  final_price: number;
  currency: string;
  guest_email: string | null;
  vehicle_type?: "car" | "van" | "bus";
}

interface GuestPaymentFormProps {
  booking: BookingData;
  onPaymentSubmitted: () => void;
  initialMethod?: string;
}

// Guest tier payment channels only (no crypto, no external_platform)
const paymentChannels = [
  {
    id: "bank_transfer_thb" as PaymentMethod,
    name: "Thai Bank Transfer",
    nameTh: "โอนเงินผ่านธนาคารไทย",
    icon: Building2,
    description: "Transfer via Thai bank account",
    descriptionTh: "โอนเงินผ่านบัญชีธนาคารไทย",
    details: {
      bankName: "Bangkok Bank",
      accountName: "IBB Shuttle Service Co., Ltd.",
      accountNumber: "123-4-56789-0",
    },
  },
  {
    id: "wise" as PaymentMethod,
    name: "Payoneer / Wise",
    nameTh: "Payoneer / Wise",
    icon: Globe,
    description: "International transfer via Wise or Payoneer",
    descriptionTh: "โอนเงินระหว่างประเทศผ่าน Wise หรือ Payoneer",
    details: {
      email: "payments@ibbshuttle.com",
      note: "Use your booking number as reference",
    },
  },
  {
    id: "credit_card" as PaymentMethod,
    name: "Credit Card",
    nameTh: "บัตรเครดิต",
    icon: CreditCard,
    description: "Pay with Visa, Mastercard, or JCB",
    descriptionTh: "ชำระด้วย Visa, Mastercard หรือ JCB",
    details: {
      note: "Contact us to receive a secure payment link",
    },
  },
];

const METHOD_MAP: Record<string, PaymentMethod> = {
  bank: "bank_transfer_thb",
  bank_transfer: "bank_transfer_thb",
  bank_transfer_thb: "bank_transfer_thb",
  wise: "wise",
  card: "credit_card",
  credit_card: "credit_card",
  cash: "cash_to_driver",
  cash_to_driver: "cash_to_driver",
};

const GuestPaymentForm = ({ booking, onPaymentSubmitted, initialMethod }: GuestPaymentFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    initialMethod ? (METHOD_MAP[initialMethod] || null) : null
  );
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Calculate deposit for cash_to_driver
  const vehicleType = booking.vehicle_type || "car";
  const depositRate = DEPOSIT_RATES[vehicleType] || 0.20;
  const depositAmount = Math.ceil(booking.final_price * depositRate);
  const cashAmount = booking.final_price - depositAmount;
  const isCashToDriver = selectedMethod === "cash_to_driver";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProofPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isCashToDriver && !transactionRef.trim()) {
      toast({
        title: "Transaction Reference Required",
        description: "Please enter a transaction reference or receipt number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use FormData for edge function (supports file upload)
      const formData = new FormData();
      formData.append("booking_id", booking.id);
      formData.append("booking_number", booking.booking_number);
      formData.append("email", booking.guest_email || "");
      formData.append("payment_method", selectedMethod);
      
      if (transactionRef.trim()) {
        formData.append("transaction_ref", transactionRef.trim());
      }
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }
      if (proofFile) {
        formData.append("proof_file", proofFile);
      }

      const { data, error } = await supabase.functions.invoke("submit-guest-payment", {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSubmitted(true);
      toast({
        title: "Payment Submitted",
        description: "Your payment notification has been received. We will verify it shortly.",
      });
      onPaymentSubmitted();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error?.message || "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {language === "th" ? "ได้รับแจ้งการชำระเงินแล้ว" : "Payment Notification Received"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === "th" 
                ? `ขอบคุณ! เราได้รับแจ้งการชำระเงินสำหรับการจอง `
                : `Thank you! We have received your payment notification for booking `}
              <span className="font-mono font-semibold">{booking.booking_number}</span>
              {language === "th"
                ? " เราจะตรวจสอบและอัปเดตสถานะการจองของคุณเร็วๆ นี้"
                : ". We will verify your payment and update your booking status shortly."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedChannel = paymentChannels.find((c) => c.id === selectedMethod);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === "th" ? "ส่งการชำระเงิน" : "Submit Payment"}</CardTitle>
        <CardDescription>
          {language === "th" 
            ? `เลือกช่องทางชำระเงินสำหรับการจอง `
            : `Select your payment method for booking `}
          <span className="font-mono font-semibold">{booking.booking_number}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
            <p className="text-sm text-muted-foreground">
              {language === "th" ? "ยอดที่ต้องชำระ" : "Amount to Pay"}
            </p>
            <p className="text-3xl font-bold text-primary">
              {booking.currency} {(isCashToDriver ? depositAmount : booking.final_price).toLocaleString()}
            </p>
            {isCashToDriver && (
              <p className="text-sm text-muted-foreground mt-1">
                ({language === "th" ? "มัดจำ" : "Deposit"} {Math.round(depositRate * 100)}% - 
                {language === "th" ? " ส่วนที่เหลือ " : " Remaining "} 
                {booking.currency} {cashAmount.toLocaleString()} 
                {language === "th" ? " จ่ายกับผู้ขับ" : " to driver"})
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>{language === "th" ? "เลือกช่องทางการชำระเงิน" : "Select Payment Method"}</Label>
            
            {/* Cash to Driver Option - Featured at top */}
            <div className="mb-4">
              <CashToDriverOption
                totalPrice={booking.final_price}
                currency={booking.currency}
                vehicleType={vehicleType}
                isSelected={selectedMethod === "cash_to_driver"}
                onSelect={() => setSelectedMethod("cash_to_driver")}
              />
            </div>

            {/* Online Payment Options */}
            <p className="text-sm text-muted-foreground mb-2">
              {language === "th" ? "หรือชำระเงินออนไลน์เต็มจำนวน:" : "Or pay full amount online:"}
            </p>
            <RadioGroup
              value={selectedMethod || ""}
              onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {paymentChannels.map((channel) => (
                <div key={channel.id}>
                  <RadioGroupItem
                    value={channel.id}
                    id={channel.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={channel.id}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <channel.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {language === "th" ? channel.nameTh : channel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === "th" ? channel.descriptionTh : channel.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Cash to driver deposit steps */}
          {isCashToDriver && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                {language === "th" ? "ขั้นตอนถัดไป:" : "Next Steps:"}
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{language === "th" 
                  ? `ชำระเงินมัดจำ ${booking.currency} ${depositAmount.toLocaleString()} ผ่านช่องทางด้านล่าง`
                  : `Pay deposit of ${booking.currency} ${depositAmount.toLocaleString()} via options below`}
                </li>
                <li>{language === "th" ? "รอการยืนยันจาก IBB" : "Wait for IBB confirmation"}</li>
                <li>{language === "th"
                  ? `ชำระเงินสด ${booking.currency} ${cashAmount.toLocaleString()} ให้ผู้ขับในวันให้บริการ`
                  : `Pay ${booking.currency} ${cashAmount.toLocaleString()} cash to driver on service day`}
                </li>
              </ol>
            </div>
          )}

          {/* Payment channel details */}
          {selectedChannel && !isCashToDriver && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="font-medium text-sm">
                {language === "th" ? "รายละเอียดการชำระเงิน:" : "Payment Details:"}
              </p>
              {selectedChannel.details.bankName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span className="font-medium">{selectedChannel.details.bankName}</span>
                </div>
              )}
              {selectedChannel.details.accountName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{selectedChannel.details.accountName}</span>
                </div>
              )}
              {selectedChannel.details.accountNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{selectedChannel.details.accountNumber}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedChannel.details.accountNumber!, "Account Number")}
                    >
                      {copied === "Account Number" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {selectedChannel.details.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedChannel.details.email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedChannel.details.email!, "Email")}
                    >
                      {copied === "Email" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {selectedChannel.details.note && (
                <p className="text-sm text-muted-foreground italic">{selectedChannel.details.note}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transactionRef">
              {language === "th" 
                ? `หมายเลขอ้างอิง / ใบเสร็จ ${isCashToDriver ? "(สำหรับมัดจำ)" : "*"}`
                : `Transaction Reference / Receipt Number ${isCashToDriver ? "(for deposit)" : "*"}`}
            </Label>
            <Input
              id="transactionRef"
              placeholder={language === "th" 
                ? "เช่น TXN123456789 หรือหมายเลขใบเสร็จ"
                : "e.g., TXN123456789 or receipt number"}
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              required={!isCashToDriver}
            />
          </div>

          {/* Payment Proof Upload */}
          <div className="space-y-2">
            <Label>
              {language === "th" ? "หลักฐานการชำระเงิน (แนะนำ)" : "Payment Proof / Transfer Slip (Recommended)"}
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {proofPreview ? (
              <div className="relative border rounded-lg p-2 bg-muted">
                <img 
                  src={proofPreview} 
                  alt="Payment proof preview" 
                  className="max-h-48 mx-auto rounded object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeProof}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {proofFile?.name}
                </p>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === "th" ? "คลิกเพื่ออัปโหลดสลิปโอนเงิน" : "Click to upload transfer slip or screenshot"}
                </span>
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {language === "th" 
                ? "อัปโหลดสลิปยืนยันการโอนหรือหลักฐานการชำระเงิน (สูงสุด 5MB, JPG/PNG)"
                : "Upload a screenshot of your transfer confirmation or bank slip (Max 5MB, JPG/PNG)"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {language === "th" ? "หมายเหตุเพิ่มเติม (ไม่บังคับ)" : "Additional Notes (Optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={language === "th" 
                ? "ข้อมูลเพิ่มเติมเกี่ยวกับการชำระเงินของคุณ..."
                : "Any additional information about your payment..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading || !selectedMethod} className="w-full">
            {loading 
              ? (language === "th" ? "กำลังส่ง..." : "Submitting...") 
              : isCashToDriver
                ? (language === "th" ? "ยืนยันการจ่ายมัดจำ" : "Confirm Deposit Payment")
                : (language === "th" ? "ส่งการแจ้งชำระเงิน" : "Submit Payment Notification")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuestPaymentForm;
