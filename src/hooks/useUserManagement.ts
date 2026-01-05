import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ManagedUser {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  school_name?: string;
  grade?: string;
  class?: string;
  role?: UserRole;
  created_at: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user || !isAdmin) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role as UserRole]));

      const formattedUsers = (profiles || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        avatar_url: p.avatar_url,
        school_name: p.school_name,
        grade: p.grade,
        class: p.class,
        role: roleMap.get(p.user_id),
        created_at: p.created_at
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    }

    setIsLoading(false);
  }, [user, isAdmin]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) {
      toast.error('Bu işlem için yetkiniz yok');
      return { error: new Error('Not authorized') };
    }

    try {
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Delete existing role first
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
      }

      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success('Kullanıcı rolü güncellendi');
      await fetchUsers();
      return { error: null };
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Rol güncellenirken hata oluştu');
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error('Bu işlem için yetkiniz yok');
      return { error: new Error('Not authorized') };
    }

    // Note: This only removes from profiles, actual auth user deletion requires admin API
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Kullanıcı profili silindi');
      await fetchUsers();
      return { error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
      return { error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    updateUserRole,
    deleteUser,
    refetch: fetchUsers
  };
};
