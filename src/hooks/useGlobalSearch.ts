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

      // Search trial exams
      const { data: trialExams } = await supabase
        .from('trial_exams')
        .select('id, title, description, grade')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (trialExams) {
        trialExams.forEach(e => {
          searchResults.push({
            id: e.id,
            title: e.title,
            type: 'exam',
            description: `${e.grade}. Sınıf`,
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
