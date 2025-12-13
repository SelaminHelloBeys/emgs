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
  Building2,
  GraduationCap,
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

const schools = [
  { id: 'gen-kurs', name: 'Gen Kurs Merkezi' },
  { id: 'ali-ihsan', name: 'Ali İhsan Hayırlıoğlu Ortaokulu' },
];

const classes = [
  '5-A', '5-B', '5-C',
  '6-A', '6-B', '6-C',
  '7-A', '7-B', '7-C',
  '8-A', '8-B', '8-C',
  '9-A', '9-B', '9-C',
  '10-A', '10-B', '10-C',
  '11-A', '11-B', '11-C',
  '12-A', '12-B', '12-C',
];

type AuthStep = 'credentials' | 'role' | 'school' | 'class' | 'teacher-verify';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<AuthStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ogretmen' | 'ogrenci' | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    completeProfile,
    isAuthenticated, 
    isLoading: authLoading,
    needsProfileCompletion,
    role 
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (needsProfileCompletion) {
        // User logged in via OAuth but needs to complete profile
        setStep('role');
        setMode('signup');
      } else if (role) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, needsProfileCompletion, role, navigate]);

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
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Google ile giriş yapılırken hata oluştu');
    }
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
    if (!name) {
      toast.error('Ad Soyad gerekli');
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
      setStep('school');
    }
  };

  const handleTeacherVerification = () => {
    if (schoolCode !== '1234567890') {
      setVerificationError('Geçersiz okul kodu. Öğretmen olarak kayıt olamazsınız.');
      return;
    }
    setStep('school');
  };

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName);
  };

  const handleContinueAfterSchool = () => {
    if (!selectedSchool) return;
    setStep('class');
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
  };

  const handleFinalSubmit = async () => {
    if (!selectedRole || !selectedSchool || !selectedClass) return;

    setIsLoading(true);

    // If user is completing OAuth profile
    if (needsProfileCompletion) {
      const { error } = await completeProfile(
        name || email.split('@')[0],
        selectedRole as UserRole,
        selectedSchool,
        selectedClass
      );
      setIsLoading(false);

      if (error) {
        toast.error('Profil tamamlanırken hata oluştu');
        return;
      }
      toast.success('Profil başarıyla tamamlandı!');
      navigate('/dashboard');
      return;
    }

    // Regular email signup
    const { error } = await signUp(
      email, 
      password, 
      selectedRole as UserRole, 
      name, 
      selectedSchool, 
      selectedClass
    );
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

              {/* Google OAuth Button */}
              <Button
                variant="outline"
                size="xl"
                className="w-full gap-3 mb-4"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
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
                Google ile Devam Et
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">veya</span>
                </div>
              </div>

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
                {needsProfileCompletion ? 'Profilinizi tamamlayın' : `${email} olarak kayıt oluyorsunuz`}
              </p>
            </div>

            {needsProfileCompletion && (
              <div className="mb-6">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Adınız Soyadınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

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
              {!needsProfileCompletion && (
                <Button
                  variant="ghost"
                  onClick={() => setStep('credentials')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </Button>
              )}
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedRole || isLoading}
                onClick={handleContinueAfterRole}
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
                    Doğrula
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 'school' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Okulunuzu Seçin</h2>
              <p className="text-muted-foreground">
                Kayıtlı olduğunuz okulu seçin
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {schools.map((school) => {
                const isSelected = selectedSchool === school.name;

                return (
                  <Card
                    key={school.id}
                    variant="interactive"
                    className={cn(
                      "p-4 cursor-pointer flex items-center gap-4",
                      isSelected && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSchoolSelect(school.name)}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="font-medium">{school.name}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep(selectedRole === 'ogretmen' ? 'teacher-verify' : 'role')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedSchool}
                onClick={handleContinueAfterSchool}
                className="gap-2"
              >
                Devam Et
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'class' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Sınıfınızı Seçin</h2>
              <p className="text-muted-foreground">
                {selectedRole === 'ogretmen' ? 'Sorumlu olduğunuz sınıfı seçin' : 'Kayıtlı olduğunuz sınıfı seçin'}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8 max-h-64 overflow-y-auto">
              {classes.map((cls) => {
                const isSelected = selectedClass === cls;

                return (
                  <Button
                    key={cls}
                    variant={isSelected ? "apple" : "outline"}
                    size="sm"
                    onClick={() => handleClassSelect(cls)}
                    className={cn(
                      "h-12",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {cls}
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep('school')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedClass || isLoading}
                onClick={handleFinalSubmit}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    Kayıt Ol
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
