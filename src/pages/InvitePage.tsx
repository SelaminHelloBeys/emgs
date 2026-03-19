import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleLabels } from '@/types/user';
import type { UserRole } from '@/types/user';
import emgLogo from '@/assets/emg-logo.png';

export const InvitePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'expired'>('loading');
  const [codeData, setCodeData] = useState<any>(null);

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setStatus('invalid');
        return;
      }

      const { data, error } = await supabase
        .from('admin_access_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      if (data.is_used) {
        setStatus('used');
        setCodeData(data);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
        setCodeData(data);
        return;
      }

      setCodeData(data);
      setStatus('valid');
    };

    validateCode();
  }, [code]);

  const handleContinue = () => {
    navigate(`/auth?davet=${code}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={emgLogo} alt="EMG" className="w-16 h-16 mx-auto rounded-2xl shadow-lg mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">EMG Davet</h1>
        </div>

        <Card className="p-6 space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Davet kodu doğrulanıyor...</p>
            </div>
          )}

          {status === 'valid' && codeData && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold">Hoş Geldiniz, {codeData.target_name}!</h2>
                <p className="text-sm text-muted-foreground">
                  Sizin için özel bir davet kodu oluşturuldu.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">
                  {roleLabels[codeData.target_role as UserRole] || codeData.target_role}
                </Badge>
                {codeData.target_school && (
                  <Badge variant="secondary">{codeData.target_school}</Badge>
                )}
                {codeData.target_class && (
                  <Badge variant="secondary">{codeData.target_class}</Badge>
                )}
              </div>
              <div className="font-mono text-sm bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                {code}
              </div>
              <Button onClick={handleContinue} className="w-full gap-2 mt-2">
                Kayıt Ol
              </Button>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Geçersiz Davet Kodu</h2>
                <p className="text-sm text-muted-foreground">Bu davet kodu bulunamadı.</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Giriş Sayfasına Git
              </Button>
            </div>
          )}

          {status === 'used' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-amber-500" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Kod Zaten Kullanılmış</h2>
                <p className="text-sm text-muted-foreground">Bu davet kodu daha önce kullanılmış.</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Giriş Sayfasına Git
              </Button>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Kodun Süresi Dolmuş</h2>
                <p className="text-sm text-muted-foreground">Bu davet kodunun geçerlilik süresi sona ermiş.</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Giriş Sayfasına Git
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
