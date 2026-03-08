import React from 'react';
import { VerificationTickType } from '@/types/user';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationTickProps {
  tickType: VerificationTickType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tickColors: Record<Exclude<VerificationTickType, 'none'>, { color: string; label: string }> = {
  blue: { color: 'text-blue-500', label: 'Onaylı Kullanıcı' },
  black: { color: 'text-foreground dark:text-white', label: 'Admin / Yönetici' },
  red: { color: 'text-red-500', label: 'Onaylı Öğretmen' },
  yellow: { color: 'text-amber-500', label: 'Onaylı Veli' },
  green: { color: 'text-emerald-500', label: 'Onaylı Yönetim' },
};

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-5.5 h-5.5',
};

export const VerificationTick: React.FC<VerificationTickProps> = ({ 
  tickType, 
  size = 'md',
  className 
}) => {
  if (tickType === 'none') return null;

  const { color, label } = tickColors[tickType];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <BadgeCheck 
          className={cn(sizeMap[size], color, 'inline-block shrink-0', className)} 
          fill="currentColor"
          stroke="white"
          strokeWidth={2.5}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
