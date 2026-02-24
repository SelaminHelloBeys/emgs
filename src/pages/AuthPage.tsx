import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { roleLabels, roleDescriptions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  { id: 'ali-ihsan', name: 'Ali İhsan Hayırlıoğlu Ortaokulu' },
];

const classes = [
  '8-A', '8-B', '8-C', '8-D', '8-E',
  '8-F', '8-G', '8-H', '8-I', '8-J',
];

type AuthStep = 'credentials' | 'role' | 'school' | 'class' | 'teacher-verify' | 'email-sent';

/* Animated background blobs */
const AuthBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    {/* Gradient base */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-apple-purple/[0.04]" />
    
    {/* Floating blobs */}
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/[0.07] blur-3xl animate-float-slow" />
    <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-apple-purple/[0.06] blur-3xl animate-float-medium" />
    <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-apple-teal/[0.05] blur-3xl animate-float-fast" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl" />
    
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

/* Step indicator dots */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-1.5 rounded-full transition-all duration-500 ease-out",
          i === currentStep 
            ? "w-8 bg-primary" 
            : i < currentStep 
              ? "w-1.5 bg-primary/40" 
              : "w-1.5 bg-border"
        )}
      />
    ))}
  </div>
);

const stepOrder: AuthStep[] = ['credentials', 'role', 'teacher-verify', 'school', 'class', 'email-sent'];
const getStepIndex = (step: AuthStep) => {
  const map: Record<AuthStep, number> = {
    'credentials': 0,
    'role': 1,
    'teacher-verify': 2,
    'school': 2,
    'class': 3,
    'email-sent': 4,
  };
  return map[step];
};

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
  const [animKey, setAnimKey] = useState(0);
  
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

  // Trigger re-animation on step change
  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [step]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (needsProfileCompletion) {
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
    if (error) {
      setIsLoading(false);
      toast.error(error.message || 'Giriş yapılırken hata oluştu');
      return;
    }
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
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
    if (!email || !password) { toast.error('E-posta ve şifre gerekli'); return; }
    if (password.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return; }
    if (!name) { toast.error('Ad Soyad gerekli'); return; }
    setStep('role');
  };

  const handleRoleSelect = (role: 'ogretmen' | 'ogrenci') => {
    setSelectedRole(role);
    setVerificationError('');
  };

  const handleContinueAfterRole = () => {
    if (!selectedRole) return;
    setStep(selectedRole === 'ogretmen' ? 'teacher-verify' : 'school');
  };

  const handleTeacherVerification = () => {
    if (schoolCode !== '1234567890') {
      setVerificationError('Geçersiz okul kodu. Öğretmen olarak kayıt olamazsınız.');
      return;
    }
    setStep('school');
  };

  const handleSchoolSelect = (schoolName: string) => setSelectedSchool(schoolName);
  const handleContinueAfterSchool = () => { if (selectedSchool) setStep('class'); };
  const handleClassSelect = (className: string) => setSelectedClass(className);

  const handleFinalSubmit = async () => {
    if (!selectedRole || !selectedSchool || !selectedClass) return;
    setIsLoading(true);

    if (needsProfileCompletion) {
      const { error } = await completeProfile(name || email.split('@')[0], selectedRole as UserRole, selectedSchool, selectedClass);
      setIsLoading(false);
      if (error) { toast.error('Profil tamamlanırken hata oluştu'); return; }
      toast.success('Profil başarıyla tamamlandı!');
      navigate('/dashboard');
      return;
    }

    const { error } = await signUp(email, password, selectedRole as UserRole, name, selectedSchool, selectedClass);
    setIsLoading(false);
    if (error) { toast.error(error.message || 'Kayıt olurken hata oluştu'); return; }
    setStep('email-sent');
  };

  const roles: ('ogretmen' | 'ogrenci')[] = ['ogrenci', 'ogretmen'];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthBackground />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalSteps = mode === 'signup' ? 5 : 1;
  const currentStepIndex = getStepIndex(step);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <AuthBackground />
      
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg relative z-10">
        {/* Step indicator for signup */}
        {mode === 'signup' && step !== 'credentials' && step !== 'email-sent' && (
          <StepIndicator currentStep={currentStepIndex} totalSteps={totalSteps} />
        )}

        {step === 'credentials' && (
          <div key={`cred-${animKey}`} className="auth-step-enter text-center">
            {/* Logo with glow */}
            <div className="mb-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl animate-pulse-soft" />
                <div className="relative w-20 h-20 rounded-3xl bg-primary shadow-apple-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-3xl">E</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-1 tracking-tight">EMG</h1>
              <p className="text-lg text-muted-foreground">Eğitim Materyal Geçidi</p>
            </div>

            {/* Auth Card */}
            <Card variant="elevated" className="max-w-md mx-auto p-8 glass-card border-border/30">
              <h2 className="text-2xl font-semibold mb-1">
                {mode === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                {mode === 'login' 
                  ? 'Eğitim platformuna giriş yapın' 
                  : 'Yeni bir hesap oluşturun'}
              </p>

              {/* Google OAuth */}
              <Button
                variant="outline"
                size="xl"
                className="w-full gap-3 mb-4 hover-lift border-border/50"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile Devam Et
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground uppercase tracking-wider">veya</span>
                </div>
              </div>

              <div className="space-y-3 stagger-children">
                {mode === 'signup' && (
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Adınız Soyadınız"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="password"
                    placeholder="Şifreniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                  />
                </div>

                <Button
                  variant="apple"
                  size="xl"
                  className="w-full gap-2 h-12 rounded-xl shadow-apple-md hover:shadow-apple-lg transition-all duration-300"
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
                    className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
                  >
                    {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
                  </button>
                </p>
              </div>
            </Card>
          </div>
        )}

        {step === 'role' && (
          <div key={`role-${animKey}`} className="auth-step-enter">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Rolünüzü Seçin</h2>
              <p className="text-muted-foreground text-sm">
                {needsProfileCompletion ? 'Profilinizi tamamlayın' : `${email} olarak kayıt oluyorsunuz`}
              </p>
            </div>

            {needsProfileCompletion && (
              <div className="mb-6 auth-step-enter" style={{ animationDelay: '100ms' }}>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Adınız Soyadınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border/50"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {roles.map((role, index) => {
                const Icon = roleIcons[role];
                const isSelected = selectedRole === role;

                return (
                  <div
                    key={role}
                    className="auth-step-enter"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <Card
                      variant="interactive"
                      className={cn(
                        "p-6 relative overflow-hidden cursor-pointer glass-card border-border/30 transition-all duration-300",
                        isSelected && "ring-2 ring-primary shadow-apple-glow border-primary/30"
                      )}
                      onClick={() => handleRoleSelect(role)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 animate-scale-in">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
                        roleColors[role],
                        isSelected && "scale-110"
                      )}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">{roleLabels[role]}</h3>
                      <p className="text-sm text-muted-foreground">{roleDescriptions[role]}</p>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              {!needsProfileCompletion && (
                <Button variant="ghost" onClick={() => setStep('credentials')} className="gap-2 rounded-xl">
                  <ArrowLeft className="w-4 h-4" /> Geri
                </Button>
              )}
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedRole || isLoading}
                onClick={handleContinueAfterRole}
                className="gap-2 rounded-xl shadow-apple-md hover:shadow-apple-lg transition-all duration-300"
              >
                Devam Et <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'teacher-verify' && (
          <div key={`verify-${animKey}`} className="auth-step-enter">
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-apple-orange/20 blur-lg animate-pulse-soft" />
                <div className="relative w-16 h-16 rounded-2xl bg-apple-orange/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-apple-orange" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Öğretmen Doğrulama</h2>
              <p className="text-muted-foreground text-sm">Okul kodunuzu girin</p>
            </div>

            <Card variant="elevated" className="p-8 glass-card border-border/30">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Okul Kodu</label>
                  <Input
                    type="text"
                    placeholder="Okul kodunuzu girin"
                    value={schoolCode}
                    onChange={(e) => { setSchoolCode(e.target.value); setVerificationError(''); }}
                    className="h-12 rounded-xl border-border/50"
                  />
                </div>

                {verificationError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive animate-scale-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{verificationError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('role')} className="flex-1 rounded-xl">Geri</Button>
                  <Button variant="apple" onClick={handleTeacherVerification} disabled={!schoolCode || isLoading} className="flex-1 gap-2 rounded-xl">
                    Doğrula <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 'school' && (
          <div key={`school-${animKey}`} className="auth-step-enter">
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg animate-pulse-soft" />
                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Okulunuzu Seçin</h2>
              <p className="text-muted-foreground text-sm">Kayıtlı olduğunuz okulu seçin</p>
            </div>

            <div className="space-y-3 mb-8">
              {schools.map((school, index) => {
                const isSelected = selectedSchool === school.name;
                return (
                  <div key={school.id} className="auth-step-enter" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <Card
                      variant="interactive"
                      className={cn(
                        "p-4 cursor-pointer flex items-center gap-4 glass-card border-border/30 transition-all duration-300",
                        isSelected && "ring-2 ring-primary shadow-apple-glow border-primary/30"
                      )}
                      onClick={() => handleSchoolSelect(school.name)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted"
                      )}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="font-medium">{school.name}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary ml-auto animate-scale-in" />
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setStep(selectedRole === 'ogretmen' ? 'teacher-verify' : 'role')} className="gap-2 rounded-xl">
                <ArrowLeft className="w-4 h-4" /> Geri
              </Button>
              <Button variant="apple" size="lg" disabled={!selectedSchool} onClick={handleContinueAfterSchool} className="gap-2 rounded-xl shadow-apple-md hover:shadow-apple-lg transition-all duration-300">
                Devam Et <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'class' && (
          <div key={`class-${animKey}`} className="auth-step-enter">
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg animate-pulse-soft" />
                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Sınıfınızı Seçin</h2>
              <p className="text-muted-foreground text-sm">
                {selectedRole === 'ogretmen' ? 'Sorumlu olduğunuz sınıfı seçin' : 'Kayıtlı olduğunuz sınıfı seçin'}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-8">
              {classes.map((cls, index) => {
                const isSelected = selectedClass === cls;
                return (
                  <div key={cls} className="auth-step-enter" style={{ animationDelay: `${index * 40}ms` }}>
                    <Button
                      variant={isSelected ? "apple" : "outline"}
                      size="sm"
                      onClick={() => handleClassSelect(cls)}
                      className={cn(
                        "h-12 w-full rounded-xl border-border/50 transition-all duration-300",
                        isSelected && "ring-2 ring-primary ring-offset-2 shadow-apple-glow scale-105"
                      )}
                    >
                      {cls}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setStep('school')} className="gap-2 rounded-xl">
                <ArrowLeft className="w-4 h-4" /> Geri
              </Button>
              <Button
                variant="apple"
                size="lg"
                disabled={!selectedClass || isLoading}
                onClick={handleFinalSubmit}
                className="gap-2 rounded-xl shadow-apple-md hover:shadow-apple-lg transition-all duration-300"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
                ) : (
                  <><Check className="w-4 h-4" /> Kayıt Ol</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'email-sent' && (
          <div key={`email-${animKey}`} className="auth-step-enter text-center">
            <div className="mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-3xl bg-apple-green/20 blur-xl animate-pulse-soft" />
                <div className="relative w-20 h-20 rounded-3xl bg-apple-green/10 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-apple-green" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">E-postanızı Kontrol Edin</h2>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                <span className="font-medium text-foreground">{email}</span> adresine bir doğrulama bağlantısı gönderdik.
              </p>
            </div>

            <Card variant="elevated" className="max-w-md mx-auto p-8 glass-card border-border/30">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>E-posta gelmedi mi? Spam/gereksiz klasörünüzü kontrol edin.</p>
                </div>
                <Button
                  variant="apple"
                  size="xl"
                  className="w-full rounded-xl shadow-apple-md"
                  onClick={() => {
                    setMode('login');
                    setStep('credentials');
                    setEmail('');
                    setPassword('');
                    setName('');
                    setSelectedRole(null);
                    setSelectedSchool(null);
                    setSelectedClass(null);
                  }}
                >
                  Giriş Sayfasına Dön
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
