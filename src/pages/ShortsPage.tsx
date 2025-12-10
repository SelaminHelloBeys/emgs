import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Short {
  id: number;
  title: string;
  teacher: string;
  teacherAvatar?: string;
  subject: string;
  likes: number;
  comments: number;
  shares: number;
  saved: boolean;
  liked: boolean;
  videoUrl?: string;
  thumbnail: string;
  duration: string;
}

const mockShorts: Short[] = [
  {
    id: 1,
    title: 'Türev nedir? 60 saniyede öğren!',
    teacher: 'Ahmet Yılmaz',
    subject: 'Matematik',
    likes: 1234,
    comments: 89,
    shares: 45,
    saved: false,
    liked: false,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=700&fit=crop',
    duration: '0:45',
  },
  {
    id: 2,
    title: 'Newton\'un 3 Kanunu Özet',
    teacher: 'Ayşe Demir',
    subject: 'Fizik',
    likes: 2456,
    comments: 156,
    shares: 78,
    saved: true,
    liked: true,
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=700&fit=crop',
    duration: '0:58',
  },
  {
    id: 3,
    title: 'Kimyasal Denklem Dengeleme',
    teacher: 'Mehmet Kaya',
    subject: 'Kimya',
    likes: 892,
    comments: 45,
    shares: 23,
    saved: false,
    liked: false,
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=700&fit=crop',
    duration: '0:52',
  },
  {
    id: 4,
    title: 'Osmanlı Kuruluş Dönemi',
    teacher: 'Fatma Özkan',
    subject: 'Tarih',
    likes: 1567,
    comments: 98,
    shares: 56,
    saved: false,
    liked: false,
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=700&fit=crop',
    duration: '0:55',
  },
  {
    id: 5,
    title: 'İngilizce Present Perfect',
    teacher: 'John Smith',
    subject: 'İngilizce',
    likes: 3421,
    comments: 234,
    shares: 123,
    saved: true,
    liked: true,
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=700&fit=crop',
    duration: '0:48',
  },
];

export const ShortsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shorts, setShorts] = useState(mockShorts);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  const currentShort = shorts[currentIndex];

  const goToNext = () => {
    if (currentIndex < shorts.length - 1) {
      setAnimationClass('animate-swipe-up');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnimationClass('');
      }, 300);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setAnimationClass('animate-swipe-down');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setAnimationClass('');
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  const toggleLike = () => {
    setShorts(shorts.map((s, i) => 
      i === currentIndex 
        ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
        : s
    ));
  };

  const toggleSave = () => {
    setShorts(shorts.map((s, i) => 
      i === currentIndex ? { ...s, saved: !s.saved } : s
    ));
  };

  return (
    <div className="fixed inset-0 bg-foreground/95 z-50 lg:relative lg:bg-background lg:z-0">
      <div className="h-full flex items-center justify-center">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center gap-8 h-full py-8">
          {/* Navigation buttons */}
          <Button
            variant="glass"
            size="icon"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="shrink-0"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>

          {/* Video Container */}
          <div 
            className="relative w-[400px] h-[700px] rounded-3xl overflow-hidden shadow-apple-xl"
            onWheel={handleWheel}
          >
            <ShortVideo 
              short={currentShort} 
              isPlaying={isPlaying}
              isMuted={isMuted}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              animationClass={animationClass}
            />
          </div>

          <Button
            variant="glass"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className="shrink-0"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>

          {/* Progress indicator */}
          <div className="flex flex-col gap-1">
            {shorts.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 h-8 rounded-full transition-all",
                  i === currentIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div 
          ref={containerRef}
          className="lg:hidden w-full h-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ShortVideo 
            short={currentShort} 
            isPlaying={isPlaying}
            isMuted={isMuted}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
            animationClass={animationClass}
            isMobile
          />
        </div>
      </div>
    </div>
  );
};

interface ShortVideoProps {
  short: Short;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  animationClass?: string;
  isMobile?: boolean;
}

const ShortVideo: React.FC<ShortVideoProps> = ({
  short,
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onToggleLike,
  onToggleSave,
  animationClass,
  isMobile,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={cn("relative w-full h-full bg-foreground", animationClass)}>
      {/* Video/Thumbnail */}
      <img
        src={short.thumbnail}
        alt={short.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/20" />

      {/* Play/Pause Overlay */}
      <button
        className="absolute inset-0 flex items-center justify-center"
        onClick={onTogglePlay}
      >
        {!isPlaying && (
          <div className="w-20 h-20 rounded-full bg-background/20 backdrop-blur-lg flex items-center justify-center animate-scale-in">
            <Play className="w-8 h-8 text-background ml-1" fill="currentColor" />
          </div>
        )}
      </button>

      {/* Right Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        {/* Like */}
        <button
          className="flex flex-col items-center gap-1"
          onClick={onToggleLike}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            short.liked ? "bg-apple-red" : "bg-background/20 backdrop-blur-sm"
          )}>
            <Heart 
              className={cn("w-6 h-6", short.liked ? "text-background" : "text-background")} 
              fill={short.liked ? "currentColor" : "none"}
            />
          </div>
          <span className="text-xs text-background font-medium">{formatNumber(short.likes)}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-background" />
          </div>
          <span className="text-xs text-background font-medium">{formatNumber(short.comments)}</span>
        </button>

        {/* Save */}
        <button
          className="flex flex-col items-center gap-1"
          onClick={onToggleSave}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            short.saved ? "bg-apple-orange" : "bg-background/20 backdrop-blur-sm"
          )}>
            <Bookmark 
              className={cn("w-6 h-6", short.saved ? "text-background" : "text-background")} 
              fill={short.saved ? "currentColor" : "none"}
            />
          </div>
          <span className="text-xs text-background font-medium">Kaydet</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-background" />
          </div>
          <span className="text-xs text-background font-medium">{formatNumber(short.shares)}</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 right-20 bottom-8">
        {/* Teacher Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-background font-semibold">{short.teacher}</p>
            <span className="text-xs text-background/80 bg-background/20 px-2 py-0.5 rounded-full">
              {short.subject}
            </span>
          </div>
        </div>

        {/* Title */}
        <p className="text-background font-medium text-lg leading-tight mb-2">
          {short.title}
        </p>

        {/* Duration */}
        <span className="text-xs text-background/70">{short.duration}</span>
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center"
          onClick={onToggleMute}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-background" />
          ) : (
            <Volume2 className="w-5 h-5 text-background" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-background/30">
        <div className="h-full bg-background w-1/3 rounded-full" />
      </div>
    </div>
  );
};
