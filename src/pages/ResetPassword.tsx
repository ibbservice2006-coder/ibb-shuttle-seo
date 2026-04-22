import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.png';

export default function ResetPassword() {
  const { user, updatePassword, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = z.string().min(6, t('resetPassword.minPassword'));

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        variant: 'destructive',
        title: t('resetPassword.linkExpired'),
        description: t('resetPassword.linkExpiredDesc'),
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast, t]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      passwordSchema.parse(newPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.newPassword = e.errors[0].message;
      }
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('resetPassword.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: t('resetPassword.failed'),
        description: error.message,
      });
    } else {
      setIsSuccess(true);
      toast({
        title: t('resetPassword.success'),
        description: t('resetPassword.successDesc'),
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="IBB Shuttle Service" className="h-24 w-auto" />
            </div>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">{t('resetPassword.success')}</CardTitle>
            <CardDescription>{t('resetPassword.successDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              {t('resetPassword.goHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="IBB Shuttle Service" className="h-24 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">{t('resetPassword.title')}</CardTitle>
          <CardDescription>{t('resetPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('resetPassword.newPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('resetPassword.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('resetPassword.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
