import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/ibb/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";

const applicationSchema = z.object({
  companyName: z.string().min(2, "Company name is required").max(200),
  contactName: z.string().min(2, "Contact name is required").max(100),
  contactEmail: z.string().email("Invalid email address").max(255),
  contactPhone: z.string().min(6, "Phone number is required").max(20),
  businessType: z.enum(["travel_agency", "corporate", "hospitality"]),
  businessDescription: z.string().max(1000).optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const translations = {
  en: {
    title: "Partnership Application",
    description: "Complete the form below to apply for our Business Partners Program",
    companyName: "Company Name",
    contactName: "Contact Person Name",
    contactEmail: "Business Email",
    contactPhone: "Phone Number",
    businessType: "Business Type",
    businessDescription: "Business Description (Optional)",
    businessDescriptionPlaceholder: "Tell us about your business and how you plan to work with IBB Shuttle Service...",
    types: {
      travel_agency: "Travel Agency",
      corporate: "Corporate",
      hospitality: "Hospitality (Hotel/Resort)"
    },
    submit: "Submit Application",
    submitting: "Submitting...",
    pendingTitle: "Application Pending",
    pendingDescription: "Your application is under review. We will contact you within 3-5 business days.",
    approvedTitle: "Application Approved",
    approvedDescription: "Congratulations! Your partnership is active.",
    goToDashboard: "Go to Partner Dashboard",
    loginRequired: "Please sign in to apply for partnership",
    signIn: "Sign In"
  },
  th: {
    title: "สมัครเป็นพันธมิตร",
    description: "กรอกแบบฟอร์มด้านล่างเพื่อสมัครโปรแกรมพันธมิตรธุรกิจ",
    companyName: "ชื่อบริษัท",
    contactName: "ชื่อผู้ติดต่อ",
    contactEmail: "อีเมลธุรกิจ",
    contactPhone: "หมายเลขโทรศัพท์",
    businessType: "ประเภทธุรกิจ",
    businessDescription: "รายละเอียดธุรกิจ (ไม่บังคับ)",
    businessDescriptionPlaceholder: "บอกเราเกี่ยวกับธุรกิจของคุณและแผนการทำงานร่วมกับ IBB Shuttle Service...",
    types: {
      travel_agency: "เอเจนซี่ท่องเที่ยว",
      corporate: "องค์กร/บริษัท",
      hospitality: "โรงแรม/รีสอร์ท"
    },
    submit: "ส่งใบสมัคร",
    submitting: "กำลังส่ง...",
    pendingTitle: "รอการอนุมัติ",
    pendingDescription: "ใบสมัครของคุณอยู่ระหว่างการตรวจสอบ เราจะติดต่อกลับภายใน 3-5 วันทำการ",
    approvedTitle: "อนุมัติแล้ว",
    approvedDescription: "ยินดีด้วย! การเป็นพันธมิตรของคุณเปิดใช้งานแล้ว",
    goToDashboard: "ไปที่ Partner Dashboard",
    loginRequired: "กรุณาเข้าสู่ระบบเพื่อสมัครเป็นพันธมิตร",
    signIn: "เข้าสู่ระบบ"
  }
};

export const PartnerApplicationForm = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{
    isActive: boolean;
    isPending: boolean;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const t = translations[language as keyof typeof translations] || translations.en;

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      businessType: "travel_agency",
      businessDescription: "",
    },
  });

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        // Get profile ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          setCheckingStatus(false);
          return;
        }

        // Check if user already has an affiliate record
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("is_active")
          .eq("profile_id", profile.id)
          .single();

        if (affiliate) {
          setExistingApplication({
            isActive: affiliate.is_active || false,
            isPending: !affiliate.is_active,
          });
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExistingApplication();
  }, [user]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "Profile not found. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create affiliate application
      const { error } = await supabase.from("affiliates").insert({
        profile_id: profile.id,
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        affiliate_type: "partner" as const,
        is_active: false, // Pending approval
        commission_rate: 5.00, // Default rate
      });

      if (error) throw error;

      setExistingApplication({ isActive: false, isPending: true });
      toast({
        title: "Application Submitted",
        description: "We will review your application and contact you soon.",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">{t.loginRequired}</p>
          <Link to="/auth">
            <Button>{t.signIn}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (existingApplication?.isActive) {
    return (
      <Card className="max-w-2xl mx-auto border-green-500/50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.approvedTitle}</h3>
          <p className="text-muted-foreground mb-6">{t.approvedDescription}</p>
          <Link to="/partner-dashboard">
            <Button>{t.goToDashboard}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (existingApplication?.isPending) {
    return (
      <Card className="max-w-2xl mx-auto border-amber-500/50">
        <CardContent className="py-12 text-center">
          <Clock className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.pendingTitle}</h3>
          <p className="text-muted-foreground">{t.pendingDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.companyName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contactName}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contactPhone}</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.contactEmail}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.businessType}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="travel_agency">{t.types.travel_agency}</SelectItem>
                      <SelectItem value="corporate">{t.types.corporate}</SelectItem>
                      <SelectItem value="hospitality">{t.types.hospitality}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.businessDescription}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={t.businessDescriptionPlaceholder}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
