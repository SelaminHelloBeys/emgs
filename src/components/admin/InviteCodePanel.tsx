import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { roleLabels } from '@/types/user';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Copy, Trash2, Loader2, KeyRound, Shield, Users, Link2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AccessCode {
  id: string;
  code: string;
  target_role: string;
  target_name: string;
  target_school: string | null;
  target_class: string | null;
  is_used: boolean;
  created_at: string;
  expires_at: string;
}

interface TeacherParentCode {
  id: string;
  code: string;
  teacher_user_id: string;
  is_used: boolean;
  parent_user_id: string | null;
  created_at: string;
  teacher_name?: string;
}

const ROLES: UserRole[] = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];

function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (length === 12) {
    return code.slice(0, 4) + '-' + code.slice(4, 8) + '-' + code.slice(8, 12);
  }
  return code.slice(0, 4) + '-' + code.slice(4);
}

export const InviteCodePanel: React.FC = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [teacherCodes, setTeacherCodes] = useState<TeacherParentCode[]>([]);
  const [teachers, setTeachers] = useState<{ user_id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isTeacherCodeOpen, setIsTeacherCodeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [formData, setFormData] = useState({
    target_name: '',
    target_role: 'ogrenci' as UserRole,
    target_school: '',
    target_class: '',
  });

  const fetchCodes = async () => {
    const { data } = await supabase
      .from('admin_access_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes((data as any[]) || []);
    setIsLoading(false);
  };

  const fetchTeacherCodes = async () => {
    const { data } = await supabase
      .from('teacher_parent_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      // Fetch teacher names
      const teacherIds = [...new Set(data.map(c => c.teacher_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', teacherIds);
      
      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.name]));
      
      setTeacherCodes(data.map(c => ({
        ...c,
        teacher_name: nameMap.get(c.teacher_user_id) || 'Bilinmiyor',
      })));
    }
  };

  const fetchTeachers = async () => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'ogretmen');
    
    if (roleData) {
      const ids = roleData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', ids);
      setTeachers(profiles || []);
    }
  };

  useEffect(() => {
    fetchCodes();
    fetchTeacherCodes();
    fetchTeachers();
  }, []);

  const handleCreate = async () => {
    if (!user || !formData.target_name) {
      toast.error('İsim alanı zorunludur');
      return;
    }

    setIsSubmitting(true);
    const code = generateCode();

    const { error } = await supabase
      .from('admin_access_codes')
      .insert({
        code,
        target_name: formData.target_name,
        target_role: formData.target_role,
        target_school: formData.target_school || null,
        target_class: formData.target_class || null,
        created_by: user.id,
      } as any);

    if (error) {
      console.error('Error creating code:', error);
      toast.error('Kod oluşturulamadı');
    } else {
      toast.success(`Kod oluşturuldu: ${code}`);
      setFormData({ target_name: '', target_role: 'ogrenci', target_school: '', target_class: '' });
      setIsOpen(false);
      fetchCodes();
    }
    setIsSubmitting(false);
  };

  const handleCreateTeacherCode = async () => {
    if (!selectedTeacherId) {
      toast.error('Bir öğretmen seçin');
      return;
    }

    setIsSubmitting(true);
    const code = generateCode(12);

    const { error } = await supabase
      .from('teacher_parent_codes')
      .insert({
        teacher_user_id: selectedTeacherId,
        code,
      } as any);

    if (error) {
      console.error('Error creating teacher code:', error);
      toast.error('Öğretmen veli kodu oluşturulamadı');
    } else {
      toast.success(`Öğretmen veli kodu oluşturuldu: ${code}`);
      setSelectedTeacherId('');
      setIsTeacherCodeOpen(false);
      fetchTeacherCodes();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('admin_access_codes').delete().eq('id', id);
    if (error) {
      toast.error('Kod silinemedi');
    } else {
      toast.success('Kod silindi');
      fetchCodes();
    }
  };

  const handleDeleteTeacherCode = async (id: string) => {
    const { error } = await supabase.from('teacher_parent_codes').delete().eq('id', id);
    if (error) {
      toast.error('Kod silinemedi');
    } else {
      toast.success('Öğretmen veli kodu silindi');
      fetchTeacherCodes();
    }
  };

  const getInviteLink = (code: string) => {
    return `${window.location.origin}/davet/${code}`;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod panoya kopyalandı');
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getInviteLink(code));
    toast.success('Davet linki panoya kopyalandı');
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
      <Tabs defaultValue="invite-codes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invite-codes" className="gap-2">
            <KeyRound className="w-4 h-4" />
            Davet Kodları
          </TabsTrigger>
          <TabsTrigger value="teacher-codes" className="gap-2">
            <Users className="w-4 h-4" />
            Öğretmen Veli Kodları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invite-codes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Davet Kodları</h2>
              <p className="text-sm text-muted-foreground">
                Özel hesap oluşturmak için davet kodu oluşturun.
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Kod
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Davet Kodu Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Hedef İsim</Label>
                    <Input
                      value={formData.target_name}
                      onChange={e => setFormData(prev => ({ ...prev, target_name: e.target.value }))}
                      placeholder="Kullanıcı adı soyadı"
                      required
                    />
                  </div>
                  <div>
                    <Label>Atanacak Rol</Label>
                    <Select value={formData.target_role} onValueChange={v => setFormData(prev => ({ ...prev, target_role: v as UserRole }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3" />
                              {roleLabels[role]}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Okul (Opsiyonel)</Label>
                    <Input
                      value={formData.target_school}
                      onChange={e => setFormData(prev => ({ ...prev, target_school: e.target.value }))}
                      placeholder="Okul adı"
                    />
                  </div>
                  <div>
                    <Label>Sınıf (Opsiyonel)</Label>
                    <Input
                      value={formData.target_class}
                      onChange={e => setFormData(prev => ({ ...prev, target_class: e.target.value }))}
                      placeholder="Ör: 8-A"
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Kod Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Henüz kod oluşturulmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map(code => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <button
                          onClick={() => copyCode(code.code)}
                          className="font-mono text-sm bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          {code.code}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{code.target_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{roleLabels[code.target_role as UserRole] || code.target_role}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.is_used ? (
                          <Badge variant="secondary">Kullanıldı</Badge>
                        ) : new Date(code.expires_at) < new Date() ? (
                          <Badge variant="destructive">Süresi Doldu</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(code.created_at), { addSuffix: true, locale: tr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyCode(code.code)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(code.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="teacher-codes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Öğretmen Veli Kodları</h2>
              <p className="text-sm text-muted-foreground">
                Öğretmenlere veli bağlantı kodu atayın. Veliler bu kodla kayıt olup öğretmene bağlanabilir.
              </p>
            </div>
            <Dialog open={isTeacherCodeOpen} onOpenChange={setIsTeacherCodeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Veli Kodu Ata
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Öğretmene Veli Kodu Ata</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Öğretmen Seçin</Label>
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Öğretmen seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => (
                          <SelectItem key={t.user_id} value={t.user_id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateTeacherCode} className="w-full gap-2" disabled={isSubmitting || !selectedTeacherId}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Kod Oluştur ve Ata
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Öğretmen</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Henüz öğretmen veli kodu oluşturulmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  teacherCodes.map(code => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <button
                          onClick={() => copyCode(code.code)}
                          className="font-mono text-sm bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          {code.code}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{code.teacher_name}</TableCell>
                      <TableCell>
                        {code.is_used ? (
                          <Badge variant="secondary">Kullanıldı</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(code.created_at), { addSuffix: true, locale: tr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyCode(code.code)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTeacherCode(code.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
