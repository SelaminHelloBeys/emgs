import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  class_section: string | null;
  due_date: string;
  attachments: string[];
  created_by: string;
  created_at: string;
  creator_name?: string;
  submission?: {
    id: string;
    status: string;
    grade: number | null;
    submitted_at: string;
  };
}

export const useHomework = () => {
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchHomework = async () => {
    if (!user) {
      setHomework([]);
      setIsLoading(false);
      return;
    }

    // Fetch homework (no join - FK points to auth.users not profiles)
    const { data: homeworkData, error } = await supabase
      .from('homework_assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching homework:', error);
      setIsLoading(false);
      return;
    }


    // Fetch creator profiles separately
    const creatorIds = [...new Set((homeworkData || []).map(hw => hw.created_by))];
    const profilesMap = new Map<string, string>();
    
    if (creatorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);
      
      profilesData?.forEach(p => profilesMap.set(p.user_id, p.name));
    }

    // Fetch user submissions
    const { data: submissionsData } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('user_id', user.id);

    const submissionsMap = new Map(submissionsData?.map(s => [s.homework_id, s]) || []);

    const formattedHomework = (homeworkData || [])
      .filter(hw => {
        if (profile?.grade && hw.grade !== profile.grade) return false;
        if (hw.class_section && profile?.class && hw.class_section !== profile.class) return false;
        return true;
      })
      .map(hw => ({
        ...hw,
        creator_name: profilesMap.get(hw.created_by) || 'Bilinmeyen',
        submission: submissionsMap.get(hw.id)
      }));

    setHomework(formattedHomework);
    setIsLoading(false);
  };

  const createHomework = async (
    title: string,
    description: string,
    subject: string,
    grade: string,
    classSection: string | null,
    dueDate: Date
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('homework_assignments')
      .insert({
        title,
        description,
        subject,
        grade,
        class_section: classSection,
        due_date: dueDate.toISOString(),
        created_by: user.id
      });

    if (error) {
      toast.error('Ödev oluşturulurken hata oluştu');
      return { error };
    }

    toast.success('Ödev başarıyla oluşturuldu');
    fetchHomework();
    return { error: null };
  };

  const submitHomework = async (homeworkId: string, fileUrl?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('homework_submissions')
      .upsert({
        homework_id: homeworkId,
        user_id: user.id,
        submission_url: fileUrl,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }, {
        onConflict: 'homework_id,user_id'
      });

    if (error) {
      toast.error('Ödev gönderilirken hata oluştu');
      return { error };
    }

    toast.success('Ödev başarıyla gönderildi');
    fetchHomework();
    return { error: null };
  };

  useEffect(() => {
    fetchHomework();
  }, [user, profile]);

  return {
    homework,
    isLoading,
    createHomework,
    submitHomework,
    refetch: fetchHomework
  };
};
