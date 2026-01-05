import React, { useState } from 'react';
import { useUserManagement, ManagedUser } from '@/hooks/useUserManagement';
import { UserRole } from '@/contexts/AuthContext';
import { roleLabels } from '@/types/user';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Search, Trash2, Loader2, User, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const ROLES: UserRole[] = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'];

export const UserManagementPanel: React.FC = () => {
  const { users, isLoading, updateUserRole, deleteUser } = useUserManagement();
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.school_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingRoles(prev => new Set(prev).add(userId));
    await updateUserRole(userId, newRole);
    setUpdatingRoles(prev => {
      const next = new Set(prev);
      next.delete(userId);
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
          <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Toplam {users.length} kullanıcı
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
              <TableHead>Okul</TableHead>
              <TableHead>Sınıf</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.grade || '-'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.school_name || '-'}</TableCell>
                <TableCell>{user.class || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {updatingRoles.has(user.user_id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Select
                        value={user.role || 'ogrenci'}
                        onValueChange={(value) => handleRoleChange(user.user_id, value as UserRole)}
                      >
                        <SelectTrigger className="w-40">
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
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                    locale: tr
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          {user.name} adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUser(user.user_id)}
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
