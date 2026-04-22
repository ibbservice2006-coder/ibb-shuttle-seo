import Header from "@/components/Header";
import PublicNavigation from "@/components/PublicNavigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Shield, 
  Clock, 
  Users, 
  BadgeCheck,
  Building2,
  Percent,
  Wallet,
  Send
} from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";

// ============================================
// PARTNERS PAGE - Level 1 shell + Level 2 Language
// First Paint < 0.3s with English fallback
// Language system loads silently after paint
// ============================================

const Partners = () => {
  const { t } = useLevel2Language();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PublicNavigation />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-dark text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-[url('/seo/hero-bangkok.jpg')] bg-cover bg-center opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 border-primary-foreground/30 text-primary-foreground">
                <BadgeCheck className="w-4 h-4 mr-2" />
                {t('partners.badge', 'By Invitation & Application Only')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 font-montserrat">
                {t('partners.title', 'Business Partners Program')}
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-4">
                {t('partners.subtitle', 'Exclusive Partnership Opportunities')}
              </p>
              <p className="text-primary-foreground/70 max-w-2xl mx-auto">
                {t('partners.description', 'Join our premium network of travel agencies, hotels, and corporate partners. Earn competitive commissions while providing your clients with Thailand\'s most trusted transportation service.')}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-montserrat">
              {t('partners.benefitsTitle', 'Partner Benefits')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Percent, titleKey: "partners.competitiveCommission", titleFallback: "Competitive Commission", descKey: "partners.competitiveCommissionDesc", descFallback: "Earn attractive commission rates on every successful booking referral" },
                { icon: Wallet, titleKey: "partners.preFundedBalance", titleFallback: "Pre-funded Balance System", descKey: "partners.preFundedBalanceDesc", descFallback: "Streamlined payment process with dedicated partner wallet" },
                { icon: Shield, titleKey: "partners.prioritySupport", titleFallback: "Priority Support", descKey: "partners.prioritySupportDesc", descFallback: "Dedicated account manager and 24/7 partner support line" },
                { icon: Clock, titleKey: "partners.realtimeDashboard", titleFallback: "Real-time Dashboard", descKey: "partners.realtimeDashboardDesc", descFallback: "Track bookings, earnings, and performance in real-time" },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-medium transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{t(benefit.titleKey, benefit.titleFallback)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{t(benefit.descKey, benefit.descFallback)}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-montserrat">
              {t('partners.categoriesTitle', 'Partner Categories')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Building2, titleKey: "partners.travelAgencies", titleFallback: "Travel Agencies", descKey: "partners.travelAgenciesDesc", descFallback: "Tour operators and travel agencies seeking reliable ground transportation" },
                { icon: Briefcase, titleKey: "partners.corporatePartners", titleFallback: "Corporate Partners", descKey: "partners.corporatePartnersDesc", descFallback: "Companies requiring regular executive and employee transportation" },
                { icon: Users, titleKey: "partners.hospitalityPartners", titleFallback: "Hospitality Partners", descKey: "partners.hospitalityPartnersDesc", descFallback: "Hotels, resorts, and accommodation providers" },
              ].map((type, index) => {
                const Icon = type.icon;
                return (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <CardTitle>{t(type.titleKey, type.titleFallback)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">
                        {t(type.descKey, type.descFallback)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-montserrat">
                {t('partners.requirementsTitle', 'Partnership Requirements')}
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {[
                      { key: "partners.req1", fallback: "Valid business registration" },
                      { key: "partners.req2", fallback: "Established customer base" },
                      { key: "partners.req3", fallback: "Commitment to service excellence" },
                      { key: "partners.req4", fallback: "Professional business references" },
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BadgeCheck className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground">{t(item.key, item.fallback)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Application Section */}
        <section id="apply" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  {t('partners.applicationTitle', 'Partnership Application')}
                </CardTitle>
                <CardDescription>
                  {t('partners.applicationDesc', 'Complete the form below to apply for our Business Partners Program')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('partners.companyName', 'Company Name')}</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder={t('partners.companyNamePlaceholder', 'Your company name')} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">{t('partners.contactPerson', 'Contact Person Name')}</label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder={t('partners.contactPersonPlaceholder', 'Full name')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">{t('partners.phoneNumber', 'Phone Number')}</label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="tel" placeholder="+66..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('partners.businessEmail', 'Business Email')}</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="email" placeholder="email@company.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('partners.businessType', 'Business Type')}</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="travel_agency">{t('partners.businessTypeTravel', 'Travel Agency')}</option>
                      <option value="corporate">{t('partners.businessTypeCorporate', 'Corporate')}</option>
                      <option value="hospitality">{t('partners.businessTypeHospitality', 'Hospitality (Hotel/Resort)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('partners.businessDescription', 'Business Description (Optional)')}</label>
                    <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} placeholder={t('partners.businessDescPlaceholder', 'Tell us about your business and how you plan to work with IBB Shuttle Service...')} />
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 w-full hover:bg-primary/90 transition-colors">
                    {t('partners.submitApplication', 'Submit Application')}
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('partners.reviewNote', 'Application review typically takes 3-5 business days')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partners;