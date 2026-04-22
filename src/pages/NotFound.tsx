import Header from "@/components/Header";
import PublicNavigation from "@/components/PublicNavigation";
import Footer from "@/components/Footer";
import { useLevel2Language } from "@/hooks/useLevel2Language";

// ============================================
// 404 PAGE - Level 1 shell + Level 2 Language
// No loading spinner, no providers
// First Paint < 0.3s with English fallback
// Includes nav/footer for consistent layout
// ============================================

const NotFound = () => {
  const { t } = useLevel2Language();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PublicNavigation />

      <main className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center px-4">
          <h1 className="mb-4 text-6xl font-bold text-primary">
            {t('notFound.title', '404')}
          </h1>
          <p className="mb-4 text-xl text-muted-foreground">
            {t('notFound.message', 'The page you requested does not exist.')}
          </p>
          <a
            href="/"
            className="text-primary font-semibold underline hover:text-primary/90"
          >
            {t('notFound.returnHome', 'Return to Home')}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;