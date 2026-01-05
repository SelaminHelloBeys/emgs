import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchResult {
  id: string;
  title: string;
  type: 'lesson' | 'exam' | 'homework' | 'user';
  description?: string;
  url: string;
}

export const useGlobalSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, canCreateContent } = useAuth();

  const search = useCallback(async (query: string) => {
    if (!user || !query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, subject, description')
        .or(`title.ilike.%${query}%,subject.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (lessons) {
        lessons.forEach(l => {
          searchResults.push({
            id: l.id,
            title: l.title,
            type: 'lesson',
            description: l.subject,
            url: '/lessons'
          });
        });
      }

      // Search exams
      const { data: exams } = await supabase
        .from('exams')
        .select('id, title, subject, description')
        .or(`title.ilike.%${query}%,subject.ilike.%${query}%`)
        .limit(5);

      if (exams) {
        exams.forEach(e => {
          searchResults.push({
            id: e.id,
            title: e.title,
            type: 'exam',
            description: e.subject,
            url: '/denemeler'
          });
        });
      }

      // Search users (only for admins)
      if (canCreateContent) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, school_name')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (profiles) {
          profiles.forEach(p => {
            searchResults.push({
              id: p.id,
              title: p.name,
              type: 'user',
              description: p.school_name || 'Kullanıcı',
              url: '/settings'
            });
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }

    setIsSearching(false);
  }, [user, canCreateContent]);

  const clearResults = () => setResults([]);

  return {
    results,
    isSearching,
    search,
    clearResults
  };
};
