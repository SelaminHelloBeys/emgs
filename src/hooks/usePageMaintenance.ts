import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PageMaintenance {
  id: string;
  page_route: string;
  page_name: string;
  is_active: boolean;
  message: string | null;
  updated_at: string;
}

export const usePageMaintenance = () => {
  const [pages, setPages] = useState<PageMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('page_maintenance')
      .select('*')
      .order('page_name');

    if (!error && data) {
      setPages(data as PageMaintenance[]);
    }
    setIsLoading(false);
  };

  const togglePage = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('page_maintenance')
      .update({ is_active: !isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await fetchPages();
    }
    return !error;
  };

  const updateMessage = async (id: string, message: string) => {
    const { error } = await supabase
      .from('page_maintenance')
      .update({ message, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await fetchPages();
    }
    return !error;
  };

  const isPageInMaintenance = (route: string): PageMaintenance | undefined => {
    return pages.find(p => p.is_active && route.startsWith(p.page_route));
  };

  useEffect(() => {
    fetchPages();

    const channel = supabase
      .channel('page_maintenance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_maintenance' }, () => {
        fetchPages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { pages, isLoading, togglePage, updateMessage, isPageInMaintenance, refetch: fetchPages };
};
