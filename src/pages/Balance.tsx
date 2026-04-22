import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { WalletBalanceCards } from "@/components/wallet/WalletBalanceCards";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { DepositForm } from "@/components/wallet/DepositForm";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Balance = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  const { balance, totalDeposits, totalSpent, transactions, profileId, isLoading, refetch } = useWallet();
  const [showDepositForm, setShowDepositForm] = useState(false);

  return (
    <>
      <Helmet>
        <title>Balance & Payments - IBB Shuttle Service</title>
        <meta name="description" content="Manage your wallet balance and payments for IBB Shuttle Service" />
      </Helmet>

      <Header />
      <Navigation />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.nav.balancePayments}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your account balance, view transaction history, and make payments.
            </p>
          </div>

          {/* Not Logged In */}
          {!user && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <LogIn className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Sign in to view your wallet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Access your balance, transaction history, and make deposits by signing in to your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/guest-payment">
                  <Button variant="outline" size="lg">
                    Pay as Guest
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Logged In - Show Wallet */}
          {user && (
            <>
              <WalletBalanceCards
                balance={balance}
                totalDeposits={totalDeposits}
                totalSpent={totalSpent}
                isLoading={isLoading}
                onDeposit={() => setShowDepositForm(true)}
              />

              <TransactionHistory transactions={transactions} isLoading={isLoading} />

              <DepositForm
                open={showDepositForm}
                onOpenChange={setShowDepositForm}
                profileId={profileId}
                onSuccess={refetch}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Balance;
