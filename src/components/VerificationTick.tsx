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

const tickColors: Record<Exclude<VerificationTickType, 'none'>, { color: string; bg: string; label: string }> = {
  blue: { color: 'text-blue-500', bg: 'text-blue-500', label: 'Onaylı Kullanıcı' },
  black: { color: 'text-zinc-900 dark:text-zinc-100', bg: 'text-zinc-900 dark:text-zinc-100', label: 'Admin / Yönetici' },
  red: { color: 'text-red-500', bg: 'text-red-500', label: 'Onaylı Öğretmen' },
  yellow: { color: 'text-amber-500', bg: 'text-amber-500', label: 'Onaylı Veli' },
  green: { color: 'text-emerald-500', bg: 'text-emerald-500', label: 'Onaylı Yönetim' },
};

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
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
          className={cn(sizeMap[size], color, 'inline-block shrink-0 drop-shadow-sm', className)} 
          fill="currentColor"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
