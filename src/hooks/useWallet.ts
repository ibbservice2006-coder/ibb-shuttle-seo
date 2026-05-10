import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface WalletTransaction {
  id: string;
  transaction_type: "deposit" | "withdrawal" | "payment" | "refund";
  amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface WalletData {
  balance: number;
  totalDeposits: number;
  totalSpent: number;
  transactions: WalletTransaction[];
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalDeposits: 0,
    totalSpent: 0,
    transactions: [],
  });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get profile with balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, wallet_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setProfileId(profile.id);

        // Get transactions
        const { data: transactions, error: txError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (txError) throw txError;

        // Calculate totals
        const totalDeposits = (transactions || [])
          .filter((t) => t.transaction_type === "deposit" || t.transaction_type === "refund")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalSpent = (transactions || [])
          .filter((t) => t.transaction_type === "payment" || t.transaction_type === "withdrawal")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        setWalletData({
          balance: Number(profile.wallet_balance) || 0,
          totalDeposits,
          totalSpent,
          transactions: (transactions || []) as WalletTransaction[],
        });
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...walletData,
    profileId,
    isLoading,
    refetch: fetchWalletData,
  };
};
