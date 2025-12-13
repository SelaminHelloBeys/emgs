import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 
  | 'yonetici'
  | 'admin'
  | 'mudur'
  | 'mudur_yardimcisi'
  | 'rehber'
  | 'ogretmen'
  | 'ogrenci';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  school_id?: string;
  school_name?: string;
  grade?: string;
  class?: string;
  subjects?: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  signUp: (email: string, password: string, role: UserRole, name?: string, schoolName?: string, className?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeProfile: (name: string, role: UserRole, schoolName: string, className: string) => Promise<{ error: Error | null }>;
  canCreateAnnouncements: boolean;
  canCreateContent: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const fetchProfileAndRole = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData as Profile);
    }

    // Fetch role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (roleData) {
      setRole(roleData.role as UserRole);
      setNeedsProfileCompletion(false);
    } else {
      // No role means user needs to complete profile (OAuth flow)
      setNeedsProfileCompletion(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchProfileAndRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setNeedsProfileCompletion(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfileAndRole(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    selectedRole: UserRole, 
    name?: string,
    schoolName?: string,
    className?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      return { error };
    }

    // Insert role for the new user
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: selectedRole });
      
      if (roleError) {
        console.error('Error inserting role:', roleError);
      }
      
      // Update profile with name, school, and class
      await supabase
        .from('profiles')
        .update({ 
          name: name || email.split('@')[0],
          school_name: schoolName,
          class: className
        })
        .eq('user_id', data.user.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    return { error: error || null };
  };

  const completeProfile = async (
    name: string, 
    selectedRole: UserRole, 
    schoolName: string, 
    className: string
  ) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    // Insert role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: selectedRole });
    
    if (roleError) {
      console.error('Error inserting role:', roleError);
      return { error: roleError };
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        name,
        school_name: schoolName,
        class: className
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return { error: profileError };
    }

    // Refresh profile and role
    await fetchProfileAndRole(user.id);

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setNeedsProfileCompletion(false);
  };

  // Admin roles that can create content
  const adminRoles: UserRole[] = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'];
  const canCreateRoles: UserRole[] = [...adminRoles, 'ogretmen'];
  const canCreateAnnouncements = role ? adminRoles.includes(role) : false;
  const canCreateContent = role ? adminRoles.includes(role) : false;
  const isAdmin = role ? adminRoles.includes(role) : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      isAuthenticated: !!user,
      isLoading,
      needsProfileCompletion,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      completeProfile,
      canCreateAnnouncements,
      canCreateContent,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
