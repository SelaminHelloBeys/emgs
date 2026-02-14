import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TrialExam {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  exam_date: string;
  grade: string;
  created_by: string;
  created_at: string;
  participation?: {
    participated: boolean;
    correct_count: number;
    wrong_count: number;
    blank_count: number;
    net_score: number;
    class_rank: number | null;
    general_rank: number | null;
  };
}

export interface StudentParticipation {
  id: string;
  exam_id: string;
  user_id: string;
  participated: boolean;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  net_score: number;
  class_rank: number | null;
  general_rank: number | null;
  profile?: {
    name: string;
    school_name: string | null;
    class: string | null;
  };
}

export const useTrialExams = () => {
  const [exams, setExams] = useState<TrialExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchExams = async () => {
    if (!user) {
      setExams([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Fetch all exams
    const { data: examsData, error } = await supabase
      .from('trial_exams')
      .select('*')
      .order('exam_date', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      setIsLoading(false);
      return;
    }

    // Fetch user's participation data
    const { data: participationData } = await supabase
      .from('student_exam_participation')
      .select('*')
      .eq('user_id', user.id);

    const participationMap = new Map(
      participationData?.map(p => [p.exam_id, p]) || []
    );

    const formattedExams: TrialExam[] = (examsData || []).map(exam => ({
      ...exam,
      participation: participationMap.has(exam.id) ? {
        participated: participationMap.get(exam.id)!.participated,
        correct_count: participationMap.get(exam.id)!.correct_count,
        wrong_count: participationMap.get(exam.id)!.wrong_count,
        blank_count: participationMap.get(exam.id)!.blank_count,
        net_score: Number(participationMap.get(exam.id)!.net_score),
        class_rank: participationMap.get(exam.id)!.class_rank,
        general_rank: participationMap.get(exam.id)!.general_rank,
      } : undefined
    }));

    setExams(formattedExams);
    setIsLoading(false);
  };

  const createExam = async (data: {
    title: string;
    description?: string;
    exam_date: string;
    grade: string;
    pdf_file: File;
    cover_image?: File;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const sanitize = (name: string) =>
      name.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
      // Upload PDF
      const pdfPath = `${user.id}/${Date.now()}-${sanitize(data.pdf_file.name)}`;
      const { error: pdfError } = await supabase.storage
        .from('exam-pdfs')
        .upload(pdfPath, data.pdf_file);

      if (pdfError) {
        console.error('PDF upload error:', pdfError);
        toast.error(`PDF yüklenirken hata: ${pdfError.message}`);
        return { error: pdfError };
      }

      const { data: pdfUrlData } = supabase.storage
        .from('exam-pdfs')
        .getPublicUrl(pdfPath);

      let coverImageUrl = null;
      
      // Upload cover image if provided
      if (data.cover_image) {
        const imagePath = `${user.id}/${Date.now()}-${sanitize(data.cover_image.name)}`;
        const { error: imageError } = await supabase.storage
          .from('exam-pdfs')
          .upload(imagePath, data.cover_image);

        if (!imageError) {
          const { data: imageUrlData } = supabase.storage
            .from('exam-pdfs')
            .getPublicUrl(imagePath);
          coverImageUrl = imageUrlData.publicUrl;
        } else {
          console.error('Cover image upload error:', imageError);
        }
      }

      // Create exam record
      const { error: examError } = await supabase
        .from('trial_exams')
        .insert({
          title: data.title,
          description: data.description || null,
          exam_date: data.exam_date,
          grade: data.grade,
          pdf_url: pdfUrlData.publicUrl,
          cover_image_url: coverImageUrl,
          created_by: user.id
        });

      if (examError) {
        console.error('Exam insert error:', examError);
        toast.error(`Deneme kaydedilirken hata: ${examError.message}`);
        return { error: examError };
      }

      toast.success('Deneme başarıyla oluşturuldu');
      fetchExams();
      return { error: null };
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast.error(`Deneme oluşturulurken hata: ${error?.message || 'Bilinmeyen hata'}`);
      return { error };
    }
  };

  const deleteExam = async (examId: string) => {
    const { error } = await supabase
      .from('trial_exams')
      .delete()
      .eq('id', examId);

    if (error) {
      toast.error('Deneme silinirken hata oluştu');
      return { error };
    }

    toast.success('Deneme silindi');
    fetchExams();
    return { error: null };
  };

  // Admin functions
  const getAllParticipations = async (examId: string): Promise<StudentParticipation[]> => {
    const { data, error } = await supabase
      .from('student_exam_participation')
      .select('*')
      .eq('exam_id', examId);

    if (error) {
      console.error('Error fetching participations:', error);
      return [];
    }

    // Get profiles for all participants
    const userIds = data?.map(p => p.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, school_name, class')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    return (data || []).map(p => ({
      ...p,
      net_score: Number(p.net_score),
      profile: profileMap.get(p.user_id) ? {
        name: profileMap.get(p.user_id)!.name,
        school_name: profileMap.get(p.user_id)!.school_name,
        class: profileMap.get(p.user_id)!.class
      } : undefined
    }));
  };

  const updateParticipation = async (
    examId: string,
    userId: string,
    data: {
      participated: boolean;
      correct_count?: number;
      wrong_count?: number;
      blank_count?: number;
      net_score?: number;
      class_rank?: number;
      general_rank?: number;
    }
  ) => {
    const { error } = await supabase
      .from('student_exam_participation')
      .upsert({
        exam_id: examId,
        user_id: userId,
        ...data
      }, {
        onConflict: 'exam_id,user_id'
      });

    if (error) {
      console.error('Error updating participation:', error);
      toast.error('Katılım güncellenirken hata oluştu');
      return { error };
    }

    toast.success('Katılım güncellendi');
    return { error: null };
  };

  const bulkImportParticipations = async (
    examId: string,
    participations: Array<{
      user_id: string;
      participated: boolean;
      correct_count: number;
      wrong_count: number;
      blank_count: number;
      net_score: number;
      class_rank?: number;
      general_rank?: number;
    }>
  ) => {
    const dataToInsert = participations.map(p => ({
      exam_id: examId,
      ...p
    }));

    const { error } = await supabase
      .from('student_exam_participation')
      .upsert(dataToInsert, {
        onConflict: 'exam_id,user_id'
      });

    if (error) {
      console.error('Error bulk importing:', error);
      toast.error('Toplu aktarım sırasında hata oluştu');
      return { error };
    }

    toast.success('Veriler başarıyla aktarıldı');
    return { error: null };
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  return {
    exams,
    isLoading,
    createExam,
    deleteExam,
    getAllParticipations,
    updateParticipation,
    bulkImportParticipations,
    refetch: fetchExams
  };
};
