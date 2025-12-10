import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels, roleDescriptions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Shield, 
  Building2, 
  GraduationCap, 
  Users, 
  Heart, 
  BookOpen, 
  Backpack,
  ArrowRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleIcons: Record<UserRole, React.ElementType> = {
  yonetici: Shield,
  admin: Building2,
  mudur: GraduationCap,
  mudur_yardimcisi: Users,
  rehber: Heart,
  ogretmen: BookOpen,
  ogrenci: Backpack,
};

const roleColors: Record<UserRole, string> = {
  yonetici: 'bg-apple-purple/10 text-apple-purple',
  admin: 'bg-apple-blue/10 text-apple-blue',
  mudur: 'bg-apple-green/10 text-apple-green',
  mudur_yardimcisi: 'bg-apple-teal/10 text-apple-teal',
  rehber: 'bg-apple-red/10 text-apple-red',
  ogretmen: 'bg-apple-orange/10 text-apple-orange',
  ogrenci: 'bg-primary/10 text-primary',
};

export const AuthPage: React.FC = () => {
  const [step, setStep] = useState<'login' | 'role'>('login');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    // Simulate Google OAuth
    setEmail('kullanici@okul.edu.tr');
    setStep('role');
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole && email) {
      login(email, selectedRole);
      navigate('/dashboard');
    }
  };

  const roles: UserRole[] = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === 'login' ? (
          <div className="animate-fade-in text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-3xl bg-primary shadow-apple-lg mx-auto flex items-center justify-center mb-6">
                <span className="text-primary-foreground font-bold text-3xl">E</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">EMG</h1>
              <p className="text-xl text-muted-foreground">Education Material Gateway</p>
            </div>

            {/* Login Card */}
            <Card variant="elevated" className="max-w-md mx-auto p-8">
              <h2 className="text-2xl font-semibold mb-2">Hoş Geldiniz</h2>
              <p className="text-muted-foreground mb-8">
                Eğitim platformuna giriş yapmak için devam edin
              </p>

              <Button
                variant="apple"
                size="xl"
                className="w-full gap-3"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile Giriş Yap
              </Button>

              <p className="text-xs text-muted-foreground mt-6">
                Giriş yaparak kullanım koşullarını kabul etmiş olursunuz
              </p>
            </Card>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Rolünüzü Seçin</h2>
              <p className="text-muted-foreground">
                {email} olarak giriş yapıyorsunuz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {roles.map((role, index) => {
                const Icon = roleIcons[role];
                const isSelected = selectedRole === role;

                return (
                  <Card
                    key={role}
                    variant="interactive"
                    className={cn(
                      "p-6 relative overflow-hidden",
                      isSelected && "ring-2 ring-primary"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleRoleSelect(role)}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                      roleColors[role]
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="font-semibold mb-1">{roleLabels[role]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {roleDescriptions[role]}
                    </p>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep('login')}
              >
                Geri
              </Button>
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedRole}
                onClick={handleContinue}
                className="gap-2"
              >
                Devam Et
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
