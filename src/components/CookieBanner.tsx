import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const KEY = 'emg-cookie-consent';

export const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(() => !localStorage.getItem(KEY));
  if (!show) return null;
  const choose = (v: string) => { localStorage.setItem(KEY, v); setShow(false); };
  return (
    <div role="dialog" aria-label="Çerez tercihi" className="fixed bottom-3 inset-x-3 sm:left-auto sm:right-4 sm:max-w-sm z-[100] rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="text-sm text-foreground mb-3">
        Yalnızca oturum ve tercihleriniz için zorunlu depolama kullanıyoruz. Reklam veya izleme çerezi yok.{' '}
        <Link to="/yasal/cerezler" className="underline">Detaylar</Link>
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => choose('essential')}>Sadece zorunlu</Button>
        <Button size="sm" className="flex-1" onClick={() => choose('accepted')}>Tamam</Button>
      </div>
    </div>
  );
};
