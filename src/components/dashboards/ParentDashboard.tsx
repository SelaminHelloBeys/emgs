import React from 'react';
import { motion } from 'framer-motion';
import { Stagger, MotionItem, HoverLift, appleSpring } from '@/components/motion/MotionElements';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BarChart3, BookOpen, Bell } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { profile } = useAuth();

  const statsData = [
    { icon: BookOpen, title: 'Dersler', desc: 'Çocuğunuzun izlediği ders sayısı', value: '-', bg: 'bg-primary/10', color: 'text-primary' },
    { icon: BarChart3, title: 'Ödevler', desc: 'Tamamlanan ödev sayısı', value: '-', bg: 'bg-apple-green/10', color: 'text-apple-green' },
    { icon: Users, title: 'Denemeler', desc: 'Katılınan deneme sayısı', value: '-', bg: 'bg-apple-orange/10', color: 'text-apple-orange' },
    { icon: Bell, title: 'Duyurular', desc: 'Okunmamış duyuru', value: '-', bg: 'bg-apple-blue/10', color: 'text-apple-blue' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={appleSpring}
      >
        <h1 className="text-3xl font-bold">Hoş Geldiniz, {profile?.name}</h1>
        <p className="text-muted-foreground">Çocuğunuzun gelişimini buradan takip edebilirsiniz.</p>
      </motion.div>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.08}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <MotionItem key={stat.title}>
              <HoverLift>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <h3 className="font-semibold">{stat.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.desc}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </Card>
              </HoverLift>
            </MotionItem>
          );
        })}
      </Stagger>

      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ ...appleSpring, delay: 0.35 }}
      >
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Veli Paneli</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Çocuğunuzun akademik gelişimini, ödevlerini ve deneme sonuçlarını buradan takip edebileceksiniz. 
            Bu özellik yakında daha detaylı hale gelecektir.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
