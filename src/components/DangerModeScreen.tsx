import React, { useState } from 'react';
import { ShieldAlert, Lock, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DangerModeScreenProps {
  onPasswordCorrect: () => void;
  correctPassword: string;
}

export const DangerModeScreen: React.FC<DangerModeScreenProps> = ({ onPasswordCorrect, correctPassword }) => {
  const { signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');
    
    // Fake delay
    await new Promise(r => setTimeout(r, 1200));
    
    if (password === correctPassword) {
      onPasswordCorrect();
    } else {
      setError('Geçersiz şifre. Lütfen tekrar deneyin.');
      toast.error('Yanlış şifre!');
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-full w-28 h-28 flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="w-14 h-14 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Güvenlik Doğrulaması
          </h1>
          <p className="text-muted-foreground text-lg">
            Tehlikeli aktivite modu aktif. Platforma erişmek için güvenlik şifresini girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Güvenlik şifresini girin"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="pl-10 text-center text-lg h-12"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button
            type="submit"
            variant="apple"
            size="lg"
            className="w-full"
            disabled={!password || isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Doğrulanıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </Button>
        </form>

        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
};
