export type UserRole = 
  | 'yonetici'      // Super Admin
  | 'admin'         // School Admin
  | 'mudur'         // Principal
  | 'mudur_yardimcisi' // Vice Principal
  | 'rehber'        // Guidance Counselor
  | 'ogretmen'      // Teacher
  | 'ogrenci';      // Student

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  grade?: string;
  class?: string;
  subjects?: string[];
  createdAt: Date;
}

export const roleLabels: Record<UserRole, string> = {
  yonetici: 'Yönetici',
  admin: 'Admin',
  mudur: 'Müdür',
  mudur_yardimcisi: 'Müdür Yardımcısı',
  rehber: 'Rehber Öğretmeni',
  ogretmen: 'Öğretmen',
  ogrenci: 'Öğrenci',
};

export const roleDescriptions: Record<UserRole, string> = {
  yonetici: 'Platform genelinde tam yetki',
  admin: 'Okul seviyesinde yönetim',
  mudur: 'Okul performans ve yönetimi',
  mudur_yardimcisi: 'Sınıf ve öğrenci takibi',
  rehber: 'Öğrenci gelişim ve destek',
  ogretmen: 'Ders ve içerik yönetimi',
  ogrenci: 'Öğrenme ve gelişim',
};

export const roleIcons: Record<UserRole, string> = {
  yonetici: 'Shield',
  admin: 'Building2',
  mudur: 'GraduationCap',
  mudur_yardimcisi: 'Users',
  rehber: 'Heart',
  ogretmen: 'BookOpen',
  ogrenci: 'Backpack',
};
