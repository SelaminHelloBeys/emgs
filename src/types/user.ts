export type UserRole = 
  | 'yonetici'      // Super Admin
  | 'admin'         // School Admin
  | 'mudur'         // Principal
  | 'mudur_yardimcisi' // Vice Principal
  | 'rehber'        // Guidance Counselor
  | 'ogretmen'      // Teacher
  | 'ogrenci'       // Student
  | 'veli';         // Parent

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
  veli: 'Veli',
};

export const roleDescriptions: Record<UserRole, string> = {
  yonetici: 'Platform genelinde tam yetki',
  admin: 'Okul seviyesinde yönetim',
  mudur: 'Okul performans ve yönetimi',
  mudur_yardimcisi: 'Sınıf ve öğrenci takibi',
  rehber: 'Öğrenci gelişim ve destek',
  ogretmen: 'Ders ve içerik yönetimi',
  ogrenci: 'Öğrenme ve gelişim',
  veli: 'Çocuğunuzun gelişimini takip edin',
};

export const roleIcons: Record<UserRole, string> = {
  yonetici: 'Shield',
  admin: 'Building2',
  mudur: 'GraduationCap',
  mudur_yardimcisi: 'Users',
  rehber: 'Heart',
  ogretmen: 'BookOpen',
  ogrenci: 'Backpack',
  veli: 'Users',
};

// Verification tick colors by role
export type VerificationTickType = 'blue' | 'black' | 'red' | 'yellow' | 'green' | 'none';

export const getVerificationTick = (role: UserRole, isVerified: boolean): VerificationTickType => {
  if (!isVerified) return 'none';
  switch (role) {
    case 'yonetici':
    case 'admin':
      return 'black';
    case 'ogretmen':
      return 'red';
    case 'veli':
      return 'yellow';
    case 'mudur':
    case 'mudur_yardimcisi':
    case 'rehber':
      return 'green';
    case 'ogrenci':
      return 'blue';
    default:
      return 'none';
  }
};
