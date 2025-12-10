import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels, roleDescriptions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Backpack,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleIcons: Record<'ogretmen' | 'ogrenci', React.ElementType> = {
  ogretmen: BookOpen,
  ogrenci: Backpack,
};

const roleColors: Record<'ogretmen' | 'ogrenci', string> = {
  ogretmen: 'bg-apple-orange/10 text-apple-orange',
  ogrenci: 'bg-primary/10 text-primary',
};

export const AuthPage: React.FC = () => {
  const [step, setStep] = useState<'login' | 'oauth' | 'role' | 'teacher-verify'>('login');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ogretmen' | 'ogrenci' | null>(null);
  const [schoolCode, setSchoolCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate OAuth redirect
    setStep('oauth');
    
    // Simulate OAuth callback after 1.5 seconds
    setTimeout(() => {
      setEmail('kullanici@okul.edu.tr');
      setIsLoading(false);
      setStep('role');
    }, 1500);
  };

  const handleRoleSelect = (role: 'ogretmen' | 'ogrenci') => {
    setSelectedRole(role);
    setVerificationError('');
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    if (selectedRole === 'ogretmen') {
      setStep('teacher-verify');
    } else {
      login(email, selectedRole);
      navigate('/dashboard');
    }
  };

  const handleTeacherVerification = () => {
    if (schoolCode !== '1234567890') {
      setVerificationError('Geçersiz okul kodu. Öğretmen olarak kayıt olamazsınız.');
      return;
    }
    
    login(email, 'ogretmen');
    navigate('/dashboard');
  };

  const roles: ('ogretmen' | 'ogrenci')[] = ['ogrenci', 'ogretmen'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'login' && (
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
        )}

        {step === 'oauth' && (
          <div className="animate-fade-in text-center">
            <Card variant="elevated" className="max-w-md mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary mx-auto flex items-center justify-center mb-6">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Google ile Bağlanılıyor</h2>
              <p className="text-muted-foreground mb-6">
                Lütfen bekleyin...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </Card>
          </div>
        )}

        {step === 'role' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Rolünüzü Seçin</h2>
              <p className="text-muted-foreground">
                {email} olarak giriş yapıyorsunuz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {roles.map((role, index) => {
                const Icon = roleIcons[role];
                const isSelected = selectedRole === role;

                return (
                  <Card
                    key={role}
                    variant="interactive"
                    className={cn(
                      "p-6 relative overflow-hidden cursor-pointer",
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
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                      roleColors[role]
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{roleLabels[role]}</h3>
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

        {step === 'teacher-verify' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-apple-orange/10 mx-auto flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-apple-orange" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Öğretmen Doğrulama</h2>
              <p className="text-muted-foreground">
                Öğretmen olarak kayıt olmak için okul kodunuzu girin
              </p>
            </div>

            <Card variant="elevated" className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Okul Kodu
                  </label>
                  <Input
                    type="text"
                    placeholder="Okul kodunuzu girin"
                    value={schoolCode}
                    onChange={(e) => {
                      setSchoolCode(e.target.value);
                      setVerificationError('');
                    }}
                    className="h-12 text-lg"
                  />
                </div>

                {verificationError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-red/10 text-apple-red">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{verificationError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setStep('role');
                      setSchoolCode('');
                      setVerificationError('');
                    }}
                  >
                    Geri
                  </Button>
                  <Button
                    variant="apple"
                    className="flex-1"
                    onClick={handleTeacherVerification}
                    disabled={!schoolCode}
                  >
                    Doğrula
                  </Button>
                </div>
              </div>
            </Card>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Okul kodunuzu okulunuzun yönetiminden alabilirsiniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
