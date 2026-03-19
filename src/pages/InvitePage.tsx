import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleLabels } from '@/types/user';
import type { UserRole } from '@/types/user';
import emgLogo from '@/assets/emg-logo.png';
import { appleSpring, appleSoftSpring } from '@/components/motion/MotionElements';

const containerVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      ...appleSpring,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: appleSpring,
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...appleSoftSpring,
      delay: 0.2,
    },
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="w-full max-w-md space-y-6 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center" variants={itemVariants}>
          <motion.img
            src={emgLogo}
            alt="EMG"
            className="w-16 h-16 mx-auto rounded-2xl shadow-lg mb-4"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={appleSoftSpring}
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">EMG Davet</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            transition={appleSpring}
          >
            <Card className="p-6 space-y-4 backdrop-blur-xl bg-card/80 border-border/50 shadow-xl">
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-8 h-8 text-primary" />
                  </motion.div>
                  <motion.p
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Davet kodu doğrulanıyor...
                  </motion.p>
                </div>
              )}

              {status === 'valid' && codeData && (
                <motion.div
                  className="flex flex-col items-center gap-4 py-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                    variants={iconVariants}
                  >
                    <motion.div variants={pulseVariants} animate="animate">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </motion.div>
                  </motion.div>
                  <motion.div className="text-center space-y-1" variants={itemVariants}>
                    <h2 className="text-xl font-semibold text-foreground">Hoş Geldiniz, {codeData.target_name}!</h2>
                    <p className="text-sm text-muted-foreground">
                      Sizin için özel bir davet kodu oluşturuldu.
                    </p>
                  </motion.div>
                  <motion.div className="flex flex-wrap gap-2 justify-center" variants={itemVariants}>
                    <Badge variant="outline">
                      {roleLabels[codeData.target_role as UserRole] || codeData.target_role}
                    </Badge>
                    {codeData.target_school && (
                      <Badge variant="secondary">{codeData.target_school}</Badge>
                    )}
                    {codeData.target_class && (
                      <Badge variant="secondary">{codeData.target_class}</Badge>
                    )}
                  </motion.div>
                  <motion.div
                    className="font-mono text-sm bg-muted px-4 py-2 rounded-lg flex items-center gap-2"
                    variants={itemVariants}
                  >
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    {code}
                  </motion.div>
                  <motion.div className="w-full" variants={itemVariants}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={appleSoftSpring}
                    >
                      <Button onClick={handleContinue} className="w-full gap-2 mt-2">
                        Kayıt Ol
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {status === 'invalid' && (
                <motion.div
                  className="flex flex-col items-center gap-4 py-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
                    variants={iconVariants}
                  >
                    <XCircle className="w-8 h-8 text-destructive" />
                  </motion.div>
                  <motion.div className="text-center space-y-1" variants={itemVariants}>
                    <h2 className="text-lg font-semibold text-foreground">Geçersiz Davet Kodu</h2>
                    <p className="text-sm text-muted-foreground">Bu davet kodu bulunamadı.</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" onClick={() => navigate('/auth')}>
                        Giriş Sayfasına Git
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {status === 'used' && (
                <motion.div
                  className="flex flex-col items-center gap-4 py-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center"
                    variants={iconVariants}
                  >
                    <CheckCircle className="w-8 h-8 text-muted-foreground" />
                  </motion.div>
                  <motion.div className="text-center space-y-1" variants={itemVariants}>
                    <h2 className="text-lg font-semibold text-foreground">Kod Zaten Kullanılmış</h2>
                    <p className="text-sm text-muted-foreground">Bu davet kodu daha önce kullanılmış.</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" onClick={() => navigate('/auth')}>
                        Giriş Sayfasına Git
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {status === 'expired' && (
                <motion.div
                  className="flex flex-col items-center gap-4 py-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
                    variants={iconVariants}
                  >
                    <XCircle className="w-8 h-8 text-destructive" />
                  </motion.div>
                  <motion.div className="text-center space-y-1" variants={itemVariants}>
                    <h2 className="text-lg font-semibold text-foreground">Kodun Süresi Dolmuş</h2>
                    <p className="text-sm text-muted-foreground">Bu davet kodunun geçerlilik süresi sona ermiş.</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" onClick={() => navigate('/auth')}>
                        Giriş Sayfasına Git
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
