import { History, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { WalletTransaction } from "@/hooks/useWallet";

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  isLoading?: boolean;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    case "refund":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "payment":
    case "withdrawal":
      return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
    default:
      return <History className="h-4 w-4" />;
  }
};

const getTransactionBadge = (type: string) => {
  switch (type) {
    case "deposit":
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Deposit</Badge>;
    case "refund":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Refund</Badge>;
    case "payment":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Payment</Badge>;
    case "withdrawal":
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Withdrawal</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const TransactionHistory = ({ transactions, isLoading }: TransactionHistoryProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Your recent wallet activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  {getTransactionIcon(tx.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getTransactionBadge(tx.transaction_type)}
                    {tx.description && (
                      <span className="text-sm text-muted-foreground truncate">
                        {tx.description}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      tx.transaction_type === "deposit" || tx.transaction_type === "refund"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {tx.transaction_type === "deposit" || tx.transaction_type === "refund" ? "+" : "-"}
                    ฿{Number(tx.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Balance: ฿{Number(tx.balance_after).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
