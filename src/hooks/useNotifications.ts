import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Use announcements as notifications for now
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      const formatted = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as 'info' | 'warning' | 'success',
        created_at: item.created_at,
        read: false // Could track read state in a separate table
      }));
      setNotifications(formatted);
      setUnreadCount(formatted.length);
    }
    setIsLoading(false);
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new announcements
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          const newNotification = {
            id: payload.new.id,
            title: payload.new.title,
            content: payload.new.content,
            type: payload.new.type as 'info' | 'warning' | 'success',
            created_at: payload.new.created_at,
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info(payload.new.title, { description: 'Yeni bildirim' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
