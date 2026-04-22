import { Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletBalanceCardsProps {
  balance: number;
  totalDeposits: number;
  totalSpent: number;
  isLoading?: boolean;
  onDeposit?: () => void;
}

export const WalletBalanceCards = ({
  balance,
  totalDeposits,
  totalSpent,
  isLoading,
  onDeposit,
}: WalletBalanceCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Current Balance */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            ฿{balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Available for bookings</p>
          {onDeposit && (
            <Button onClick={onDeposit} className="mt-4 w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Total Deposits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
          <ArrowDownLeft className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ฿{totalDeposits.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time deposits</p>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <ArrowUpRight className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            ฿{totalSpent.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Used for bookings</p>
        </CardContent>
      </Card>
    </div>
  );
};
