import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CashToDriverOptionProps {
  totalPrice: number;
  currency: string;
  vehicleType: "car" | "van" | "bus";
  isSelected: boolean;
  onSelect: () => void;
}

// Deposit percentages by vehicle type
const DEPOSIT_RATES: Record<string, number> = {
  car: 0.20,   // 20%
  van: 0.25,   // 25%
  bus: 0.30,   // 30%
};

const CashToDriverOption = ({
  totalPrice,
  currency,
  vehicleType,
  isSelected,
  onSelect,
}: CashToDriverOptionProps) => {
  const { language } = useLanguage();
  const [showConditions, setShowConditions] = useState(false);

  const depositRate = DEPOSIT_RATES[vehicleType] || 0.20;
  const depositAmount = Math.ceil(totalPrice * depositRate);
  const cashAmount = totalPrice - depositAmount;

  const translations = {
    en: {
      title: "Cash to Driver (IBB Authorized)",
      description: "Pay deposit online, remaining in cash to driver",
      depositLabel: "Online Deposit",
      cashLabel: "Pay to Driver",
      depositNote: "Pay part of the fare online as a deposit. The remaining balance is paid in cash to the driver at service time. All prices are fixed and authorized by IBB.",
      conditionsTitle: "Cash Payment Conditions",
      condition1: "Prices are fixed and authorized by IBB",
      condition2: "No negotiation with the driver",
      condition3: "Pay only the amount shown in the system",
      condition4: "IBB is responsible for service support",
      transparencyNote: "IBB does not charge hidden commissions. All prices are transparent and fixed. Cash payment is provided for customer convenience only.",
      showConditions: "View conditions",
      hideConditions: "Hide conditions",
    },
    th: {
      title: "ชำระเงินสดกับผู้ขับ (ภายใต้การควบคุมของ IBB)",
      description: "จ่ายมัดจำออนไลน์ ส่วนที่เหลือจ่ายเงินสดกับผู้ขับ",
      depositLabel: "มัดจำออนไลน์",
      cashLabel: "จ่ายกับผู้ขับ",
      depositNote: "ชำระเงินมัดจำผ่านระบบ IBB และชำระเงินส่วนที่เหลือเป็นเงินสดกับผู้ขับในวันให้บริการ ราคาทั้งหมดถูกกำหนดและควบคุมโดย IBB ไม่มีค่าใช้จ่ายแอบแฝง",
      conditionsTitle: "เงื่อนไขการชำระเงินสด",
      condition1: "ราคาถูกกำหนดโดย IBB และเป็นราคาตายตัว",
      condition2: "ห้ามต่อรองราคากับผู้ขับ",
      condition3: "ชำระเงินเฉพาะยอดที่ระบบแจ้งเท่านั้น",
      condition4: "หากเกิดปัญหา IBB เป็นผู้ดูแลรับผิดชอบ",
      transparencyNote: "IBB ไม่มีการหักหัวคิวแอบแฝง ราคาที่คุณเห็นคือราคาที่คุณจ่าย การชำระเงินสดเป็นเพียงทางเลือกเพื่อความสะดวกของลูกค้า",
      showConditions: "ดูเงื่อนไข",
      hideConditions: "ซ่อนเงื่อนไข",
    },
    zh: {
      title: "司机现金支付（IBB授权）",
      description: "在线支付押金，剩余部分现金支付给司机",
      depositLabel: "在线押金",
      cashLabel: "支付给司机",
      depositNote: "在线支付部分费用作为押金。剩余费用在服务时现金支付给司机。所有价格均由IBB固定和授权。",
      conditionsTitle: "现金支付条件",
      condition1: "价格由IBB固定和授权",
      condition2: "不得与司机议价",
      condition3: "仅支付系统显示的金额",
      condition4: "IBB负责服务支持",
      transparencyNote: "IBB不收取隐藏佣金。所有价格透明固定。现金支付仅为客户方便而提供。",
      showConditions: "查看条件",
      hideConditions: "隐藏条件",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div>
      <RadioGroupItem
        value="cash_to_driver"
        id="cash_to_driver"
        className="peer sr-only"
      />
      <Label
        htmlFor="cash_to_driver"
        className={`block cursor-pointer transition-all ${
          isSelected
            ? "ring-2 ring-primary"
            : "hover:bg-accent"
        }`}
        onClick={onSelect}
      >
        <Card className={`border ${isSelected ? "border-primary bg-primary/5" : ""}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {t.title}
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    IBB
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            </div>
          </CardHeader>
          
          {isSelected && (
            <CardContent className="pt-0 space-y-4">
              {/* Price Breakdown */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Price:</span>
                  <span className="font-semibold">{currency} {totalPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {t.depositLabel} ({Math.round(depositRate * 100)}%)
                    </span>
                    <span className="font-semibold text-primary">
                      {currency} {depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {t.cashLabel}
                    </span>
                    <span className="font-semibold text-amber-600">
                      {currency} {cashAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transparency Note */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {t.transparencyNote}
                  </p>
                </div>
              </div>

              {/* Conditions Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConditions(!showConditions);
                }}
              >
                {showConditions ? t.hideConditions : t.showConditions}
              </Button>

              {/* Conditions */}
              {showConditions && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t.conditionsTitle}
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {t.condition1}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {t.condition2}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {t.condition3}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {t.condition4}
                    </li>
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {t.depositNote}
              </p>
            </CardContent>
          )}
        </Card>
      </Label>
    </div>
  );
};

export default CashToDriverOption;

export { DEPOSIT_RATES };
