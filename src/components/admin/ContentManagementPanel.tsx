import React, { useState } from 'react';
import { useLessons, Lesson } from '@/hooks/useLessons';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, Video, FileText, Film, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

export const ContentManagementPanel: React.FC = () => {
  const { lessons, isLoading, refetch } = useLessons();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'short':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    setDeletingIds(prev => new Set(prev).add(lesson.id));

    try {
      // Delete from database
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (error) throw error;

      // Also try to delete from storage if file exists
      if (lesson.file_url) {
        const urlParts = lesson.file_url.split('/lessons/');
        if (urlParts[1]) {
          await supabase.storage.from('lessons').remove([urlParts[1]]);
        }
      }

      toast.success('İçerik başarıyla silindi');
      refetch();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('İçerik silinirken hata oluştu');
    }

    setDeletingIds(prev => {
      const next = new Set(prev);
      next.delete(lesson.id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">İçerik Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Toplam {lessons.length} içerik
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="İçerik ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Ders</TableHead>
              <TableHead>Ünite</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Oluşturan</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getIcon(lesson.content_type)}
                    </div>
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                </TableCell>
                <TableCell>{lesson.subject}</TableCell>
                <TableCell>{lesson.topic || '-'}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                    {lesson.content_type === 'video' ? 'Video' : 
                     lesson.content_type === 'short' ? 'Kısa Video' : 'PDF'}
                  </span>
                </TableCell>
                <TableCell>{lesson.creator_name}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(lesson.created_at), {
                    addSuffix: true,
                    locale: tr
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        disabled={deletingIds.has(lesson.id)}
                      >
                        {deletingIds.has(lesson.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>İçeriği Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{lesson.title}" adlı içeriği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(lesson)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
