import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  currency: string;
  description: string | null;
  created_at: string;
}

interface WalletTransactionListProps {
  profileId: string | undefined;
}

const WalletTransactionList = ({ profileId }: WalletTransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!profileId) { setIsLoading(false); return; }
      setIsLoading(true);
      const { data } = await supabase
        .from("wallet_transactions")
        .select("id, transaction_type, amount, balance_after, currency, description, created_at")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(15);
      setTransactions(data || []);
      setIsLoading(false);
    };
    fetch();
  }, [profileId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading transactions...
        </CardContent>
      </Card>
    );
  }

  const isCredit = (type: string) => ["deposit", "refund"].includes(type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isCredit(tx.transaction_type) ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {isCredit(tx.transaction_type) ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.description || tx.transaction_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isCredit(tx.transaction_type) ? "text-green-600" : "text-red-600"}`}>
                    {isCredit(tx.transaction_type) ? "+" : "-"}฿{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: ฿{tx.balance_after.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTransactionList;
