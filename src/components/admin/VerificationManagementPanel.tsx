import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { roleLabels, getVerificationTick } from '@/types/user';
import { VerificationTick } from '@/components/VerificationTick';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, BadgeCheck, Loader2, User, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserVerification {
  user_id: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
}

export const VerificationManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  const fetchUsers = async () => {
    const [profilesRes, rolesRes, verificationsRes] = await Promise.all([
      supabase.from('profiles').select('user_id, name'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('user_verifications').select('user_id, is_verified'),
    ]);

    const roleMap = new Map(rolesRes.data?.map(r => [r.user_id, r.role as UserRole]) || []);
    const verifyMap = new Map(verificationsRes.data?.map(v => [v.user_id, v.is_verified]) || []);

    const combined: UserVerification[] = (profilesRes.data || []).map(p => ({
      user_id: p.user_id,
      name: p.name,
      role: roleMap.get(p.user_id) || 'ogrenci',
      is_verified: verifyMap.get(p.user_id) || false,
    }));

    setUsers(combined);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdatingUsers(prev => new Set(prev).add(userId));

    // Try update first, if no rows affected then insert
    const { error: updateError, count } = await supabase
      .from('user_verifications')
      .update({ 
        is_verified: !currentStatus, 
        verified_at: !currentStatus ? new Date().toISOString() : null,
        verified_by: user?.id 
      } as any)
      .eq('user_id', userId);

    if (updateError) {
      // Try insert
      await supabase.from('user_verifications').insert({
        user_id: userId,
        is_verified: !currentStatus,
        verified_at: !currentStatus ? new Date().toISOString() : null,
        verified_by: user?.id,
      } as any);
    }

    toast.success(!currentStatus ? 'Kullanıcı doğrulandı' : 'Doğrulama kaldırıldı');
    
    setUsers(prev => prev.map(u => 
      u.user_id === userId ? { ...u, is_verified: !currentStatus } : u
    ));

    setUpdatingUsers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const verifiedCount = users.filter(u => u.is_verified).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-primary" />
            Doğrulama Yönetimi
          </h2>
          <p className="text-sm text-muted-foreground">
            {verifiedCount} / {users.length} kullanıcı doğrulanmış
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara..."
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
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tik Rengi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const tickType = getVerificationTick(u.role, u.is_verified);
              return (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{u.name}</span>
                        <VerificationTick tickType={tickType} size="sm" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[u.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_verified ? (
                      <VerificationTick tickType={tickType} size="md" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Tik yok</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.is_verified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Doğrulanmış</Badge>
                    ) : (
                      <Badge variant="secondary">Doğrulanmamış</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={u.is_verified ? "outline" : "default"}
                      size="sm"
                      className="gap-2"
                      disabled={updatingUsers.has(u.user_id)}
                      onClick={() => toggleVerification(u.user_id, u.is_verified)}
                    >
                      {updatingUsers.has(u.user_id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.is_verified ? (
                        <><XCircle className="w-4 h-4" /> Kaldır</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Doğrula</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
