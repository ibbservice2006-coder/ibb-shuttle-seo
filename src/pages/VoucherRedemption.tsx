import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/ibb/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ticket, CheckCircle, Calendar, DollarSign, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface VoucherInfo {
  id: string;
  code: string;
  voucher_value: number;
  remaining_value: number;
  voucher_status: string;
  voucher_type: string;
  external_platform: string | null;
  valid_from: string;
  valid_until: string;
  buyer_name: string | null;
  buyer_email: string | null;
}

const VoucherRedemption = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedVoucher, setValidatedVoucher] = useState<VoucherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!voucherCode.trim()) {
      setError("กรุณากรอกรหัส Voucher");
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidatedVoucher(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("validate-voucher", {
        body: {
          voucher_code: voucherCode.trim(),
          action: "validate",
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data.success) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setValidatedVoucher(data.voucher);
      toast.success("ตรวจสอบ Voucher สำเร็จ!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบ";
      setError(message);
      toast.error(message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceedToBooking = () => {
    if (validatedVoucher) {
      // Navigate to booking with voucher info
      navigate(`/?voucher=${validatedVoucher.code}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "พร้อมใช้งาน", variant: "default" },
      sold: { label: "พร้อมใช้งาน", variant: "default" },
      activated: { label: "เปิดใช้งานแล้ว", variant: "default" },
      redeemed: { label: "ใช้แล้ว", variant: "secondary" },
      expired: { label: "หมดอายุ", variant: "destructive" },
      cancelled: { label: "ยกเลิก", variant: "destructive" },
    };
    const { label, variant } = config[status] || { label: status, variant: "outline" as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>ใช้ Voucher | IBB Shuttle Service</title>
        <meta name="description" content="ใช้ Voucher code เพื่อจองบริการรถรับส่งของ IBB Shuttle Service" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <div className="container max-w-xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">ใช้ Voucher</h1>
            <p className="text-muted-foreground">
              กรอกรหัส Voucher ที่คุณซื้อมาเพื่อจองบริการรถรับส่ง
            </p>
          </div>

          {/* Voucher Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">กรอกรหัส Voucher</CardTitle>
              <CardDescription>
                รหัส Voucher จะอยู่ในอีเมลยืนยันการซื้อจาก Platform ที่คุณซื้อ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="เช่น IBB-XXXXXXXX"
                  className="flex-1 font-mono text-lg tracking-wider"
                  onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                />
                <Button onClick={handleValidate} disabled={isValidating}>
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "ตรวจสอบ"
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-3">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Validated Voucher Info */}
          {validatedVoucher && (
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg text-green-700 dark:text-green-400">
                      Voucher ถูกต้อง!
                    </CardTitle>
                  </div>
                  {getStatusBadge(validatedVoucher.voucher_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voucher Code */}
                <div className="text-center p-4 bg-white dark:bg-background rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground mb-1">รหัส Voucher</p>
                  <p className="text-2xl font-mono font-bold tracking-widest">
                    {validatedVoucher.code}
                  </p>
                </div>

                {/* Voucher Value */}
                <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-bold text-primary">
                    ฿{validatedVoucher.voucher_value.toLocaleString()}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">ใช้ได้ถึง</p>
                      <p className="font-medium">
                        {format(new Date(validatedVoucher.valid_until), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Platform</p>
                    <p className="font-medium capitalize">
                      {validatedVoucher.external_platform || "IBB Direct"}
                    </p>
                  </div>
                </div>

                {validatedVoucher.buyer_name && (
                  <div className="text-sm border-t pt-4">
                    <p className="text-muted-foreground">ผู้ซื้อ</p>
                    <p className="font-medium">{validatedVoucher.buyer_name}</p>
                    {validatedVoucher.buyer_email && (
                      <p className="text-muted-foreground">{validatedVoucher.buyer_email}</p>
                    )}
                  </div>
                )}

                {/* Proceed Button */}
                {["available", "sold", "activated"].includes(validatedVoucher.voucher_status) && (
                  <Button 
                    onClick={handleProceedToBooking} 
                    className="w-full mt-4" 
                    size="lg"
                  >
                    ดำเนินการจอง
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">มีปัญหาในการใช้ Voucher?</p>
            <p>
              ติดต่อ:{" "}
              <a href="mailto:support@ibb-shuttle.com" className="text-primary hover:underline">
                support@ibb-shuttle.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default VoucherRedemption;
