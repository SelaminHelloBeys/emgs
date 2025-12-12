import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { roleLabels, roleDescriptions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Backpack,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const roleIcons: Record<'ogretmen' | 'ogrenci', React.ElementType> = {
  ogretmen: BookOpen,
  ogrenci: Backpack,
};

const roleColors: Record<'ogretmen' | 'ogrenci', string> = {
  ogretmen: 'bg-apple-orange/10 text-apple-orange',
  ogrenci: 'bg-primary/10 text-primary',
};

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'credentials' | 'role' | 'teacher-verify'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ogretmen' | 'ogrenci' | null>(null);
  const [schoolCode, setSchoolCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('E-posta ve şifre gerekli');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Giriş yapılırken hata oluştu');
      return;
    }

    navigate('/dashboard');
  };

  const handleContinueToRole = () => {
    if (!email || !password) {
      toast.error('E-posta ve şifre gerekli');
      return;
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }
    setStep('role');
  };

  const handleRoleSelect = (role: 'ogretmen' | 'ogrenci') => {
    setSelectedRole(role);
    setVerificationError('');
  };

  const handleContinueAfterRole = () => {
    if (!selectedRole) return;

    if (selectedRole === 'ogretmen') {
      setStep('teacher-verify');
    } else {
      handleSignUp('ogrenci');
    }
  };

  const handleTeacherVerification = () => {
    if (schoolCode !== '1234567890') {
      setVerificationError('Geçersiz okul kodu. Öğretmen olarak kayıt olamazsınız.');
      return;
    }
    handleSignUp('ogretmen');
  };

  const handleSignUp = async (role: UserRole) => {
    setIsLoading(true);
    const { error } = await signUp(email, password, role, name || undefined);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Kayıt olurken hata oluştu');
      return;
    }

    toast.success('Hesap başarıyla oluşturuldu!');
    navigate('/dashboard');
  };

  const roles: ('ogretmen' | 'ogrenci')[] = ['ogrenci', 'ogretmen'];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'credentials' && (
          <div className="animate-fade-in text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-3xl bg-primary shadow-apple-lg mx-auto flex items-center justify-center mb-6">
                <span className="text-primary-foreground font-bold text-3xl">E</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">EMG</h1>
              <p className="text-xl text-muted-foreground">Education Material Gateway</p>
            </div>

            {/* Auth Card */}
            <Card variant="elevated" className="max-w-md mx-auto p-8">
              <h2 className="text-2xl font-semibold mb-2">
                {mode === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mode === 'login' 
                  ? 'Eğitim platformuna giriş yapın' 
                  : 'Yeni bir hesap oluşturun'}
              </p>

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Adınız Soyadınız"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Şifreniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant="apple"
                  size="xl"
                  className="w-full gap-2"
                  onClick={mode === 'login' ? handleLogin : handleContinueToRole}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === 'login' ? 'Giriş yapılıyor...' : 'Devam ediliyor...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Giriş Yap' : 'Devam Et'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                  {' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setStep('credentials');
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
                  </button>
                </p>
              </div>
            </Card>
          </div>
        )}

        {step === 'role' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Rolünüzü Seçin</h2>
              <p className="text-muted-foreground">
                {email} olarak kayıt oluyorsunuz
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
                onClick={() => setStep('credentials')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedRole || isLoading}
                onClick={handleContinueAfterRole}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kayıt yapılıyor...
                  </>
                ) : (
                  <>
                    Devam Et
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
                  />
                </div>

                {verificationError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{verificationError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('role')}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button
                    variant="apple"
                    onClick={handleTeacherVerification}
                    disabled={!schoolCode || isLoading}
                    className="flex-1 gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Doğrulanıyor...
                      </>
                    ) : (
                      <>
                        Doğrula ve Kayıt Ol
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
