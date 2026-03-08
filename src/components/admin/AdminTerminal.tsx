import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

const HELP_TEXT = `
╔═══════════════════════════════════════════════════════════╗
║              EMG Admin Terminal v2.0                       ║
╠═══════════════════════════════════════════════════════════╣
║ PLATFORM MODLARI:                                         ║
║   enable_development     - Geliştirme modunu aç           ║
║   disable_development    - Geliştirme modunu kapat        ║
║   enable_maintenance     - Bakım modunu aç                ║
║   disable_maintenance    - Bakım modunu kapat             ║
║   enable_danger          - Tehlike modunu aç               ║
║   disable_danger         - Tehlike modunu kapat            ║
║   enable_tablet          - Tablet modunu aç                ║
║   disable_tablet         - Tablet modunu kapat             ║
║   set_danger_password <pw> - Tehlike modu şifresi ayarla  ║
║                                                           ║
║ KULLANICI YÖNETİMİ:                                      ║
║   list_users             - Tüm kullanıcıları listele      ║
║   user_info <isim>       - Kullanıcı bilgisi              ║
║   set_role <isim> <rol>  - Kullanıcı rolünü değiştir      ║
║   delete_user <isim>     - Kullanıcıyı sil                ║
║   verify_user <isim>     - Kullanıcıyı doğrula            ║
║   unverify_user <isim>   - Doğrulamayı kaldır             ║
║   search_users <anahtar> - Kullanıcı ara                  ║
║                                                           ║
║ İÇERİK YÖNETİMİ:                                         ║
║   list_lessons           - Dersleri listele                ║
║   list_exams             - Denemeleri listele              ║
║   list_homework          - Ödevleri listele                ║
║   list_announcements     - Duyuruları listele              ║
║   delete_lesson <id>     - Ders sil                       ║
║   delete_exam <id>       - Deneme sil                     ║
║   delete_homework <id>   - Ödev sil                       ║
║   delete_announcement <id> - Duyuru sil                   ║
║                                                           ║
║ ROZET & İSTATİSTİK:                                       ║
║   list_badges            - Rozetleri listele               ║
║   grant_badge <isim> <badge_id> - Rozet ver               ║
║   revoke_badge <isim> <badge_id> - Rozet kaldır           ║
║   user_stats <isim>      - Kullanıcı istatistikleri       ║
║   reset_stats <isim>     - İstatistikleri sıfırla         ║
║                                                           ║
║ DAVET KODLARI:                                            ║
║   list_codes             - Davet kodlarını listele         ║
║   create_code <isim> <rol> - Yeni davet kodu oluştur      ║
║   delete_code <id>       - Davet kodunu sil               ║
║                                                           ║
║ SAYFA BAKIMI:                                             ║
║   list_maintenance       - Bakım sayfalarını listele      ║
║   enable_page_maintenance <route> - Sayfa bakıma al       ║
║   disable_page_maintenance <route> - Sayfa bakımdan çık   ║
║                                                           ║
║ VERİTABANI (SQL-benzeri):                                 ║
║   count <tablo>          - Tablodaki kayıt sayısı         ║
║   select <tablo> [limit] - Tablodan veri çek              ║
║   tables                 - Tüm tabloları listele          ║
║                                                           ║
║ BİLDİRİMLER:                                              ║
║   broadcast <mesaj>      - Tüm kullanıcılara bildirim     ║
║                                                           ║
║ SİSTEM:                                                   ║
║   status                 - Platform durumu                ║
║   whoami                 - Mevcut kullanıcı bilgisi       ║
║   uptime                 - Sistem çalışma süresi          ║
║   clear                  - Terminali temizle              ║
║   help                   - Bu yardım mesajı               ║
╚═══════════════════════════════════════════════════════════╝
`.trim();

const VALID_TABLES = ['profiles', 'lessons', 'trial_exams', 'homework_assignments', 'homework_submissions', 'announcements', 'user_roles', 'user_stats', 'video_watch_progress', 'badges', 'user_badges', 'student_exam_participation', 'platform_settings', 'parent_codes', 'admin_access_codes', 'page_maintenance', 'user_verifications', 'teacher_parent_codes'];

export const AdminTerminal: React.FC = () => {
  const { user, profile } = useAuth();
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'EMG Admin Terminal v2.0 - "help" yazarak komut listesini görebilirsiniz.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text }]);
  };

  const togglePlatformMode = async (key: string, value: boolean) => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', key);
    if (error) return addLine('error', `Hata: ${error.message}`);
    addLine('success', `${key} → ${value ? 'AKTİF' : 'KAPALI'}`);
  };

  const findUser = async (name: string) => {
    const { data } = await supabase.from('profiles').select('user_id, name').ilike('name', `%${name}%`).maybeSingle();
    return data;
  };

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `$ ${trimmed}`);
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
          addLine('info', HELP_TEXT);
          break;

        case 'clear':
          setLines([]);
          break;

        case 'whoami': {
          addLine('info', `  Kullanıcı: ${profile?.name || 'Bilinmiyor'}\n  ID: ${user?.id}\n  Email: ${user?.email}`);
          break;
        }

        case 'uptime': {
          const ms = Date.now() - startTime.current;
          const mins = Math.floor(ms / 60000);
          const secs = Math.floor((ms % 60000) / 1000);
          addLine('info', `Terminal çalışma süresi: ${mins}dk ${secs}sn`);
          break;
        }

        case 'status': {
          const { data } = await supabase.from('platform_settings').select('setting_key, setting_value');
          const modes = data?.map(s => `  ${s.setting_key}: ${s.setting_value ? '🟢 AKTİF' : '🔴 KAPALI'}`).join('\n');
          const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
          addLine('info', `Platform Durumu:\n${modes || '  Veri yok'}\n\n  Toplam Kullanıcı: ${userCount}\n  Toplam Ders: ${lessonCount}`);
          break;
        }

        case 'tables': {
          addLine('info', `Tablolar (${VALID_TABLES.length}):\n${VALID_TABLES.map(t => `  • ${t}`).join('\n')}`);
          break;
        }

        // Platform modes
        case 'enable_development': await togglePlatformMode('development_mode', true); break;
        case 'disable_development': await togglePlatformMode('development_mode', false); break;
        case 'enable_maintenance': await togglePlatformMode('maintenance_mode', true); break;
        case 'disable_maintenance': await togglePlatformMode('maintenance_mode', false); break;
        case 'enable_danger': await togglePlatformMode('danger_detection_mode', true); break;
        case 'disable_danger': await togglePlatformMode('danger_detection_mode', false); break;
        case 'enable_tablet': await togglePlatformMode('tablet_mode', true); break;
        case 'disable_tablet': await togglePlatformMode('tablet_mode', false); break;

        case 'set_danger_password': {
          if (!args[0]) return addLine('error', 'Kullanım: set_danger_password <şifre>');
          const { error } = await supabase.from('platform_settings').update({ text_value: args[0] }).eq('setting_key', 'danger_detection_mode');
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Tehlike modu şifresi güncellendi.`);
          break;
        }

        // User management
        case 'list_users': {
          const { data, error } = await supabase.from('profiles').select('user_id, name, school_name, class, grade, created_at').order('created_at', { ascending: false }).limit(50);
          if (error) return addLine('error', `Hata: ${error.message}`);
          if (!data?.length) return addLine('info', 'Kullanıcı bulunamadı.');
          const table = data.map((u, i) => `  ${i + 1}. ${u.name} | ${u.school_name || '-'} | ${u.grade || '-'}/${u.class || '-'} | ${new Date(u.created_at).toLocaleDateString('tr-TR')}`).join('\n');
          addLine('info', `Kullanıcılar (${data.length}):\n${table}`);
          break;
        }

        case 'search_users': {
          if (!args[0]) return addLine('error', 'Kullanım: search_users <anahtar>');
          const { data } = await supabase.from('profiles').select('user_id, name, school_name, class').ilike('name', `%${args[0]}%`).limit(20);
          if (!data?.length) return addLine('info', 'Kullanıcı bulunamadı.');
          const table = data.map((u, i) => `  ${i + 1}. ${u.name} | ${u.school_name || '-'} | ${u.class || '-'}`).join('\n');
          addLine('info', `Sonuçlar (${data.length}):\n${table}`);
          break;
        }

        case 'user_info': {
          if (!args[0]) return addLine('error', 'Kullanım: user_info <isim>');
          const { data } = await supabase.from('profiles').select('*').ilike('name', `%${args.join(' ')}%`).limit(5);
          if (!data?.length) return addLine('error', 'Kullanıcı bulunamadı.');
          for (const u of data) {
            const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', u.user_id);
            const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', u.user_id).maybeSingle();
            const { data: verification } = await supabase.from('user_verifications').select('is_verified').eq('user_id', u.user_id).maybeSingle();
            addLine('info', [
              `  İsim: ${u.name}`,
              `  ID: ${u.user_id}`,
              `  Okul: ${u.school_name || '-'}`,
              `  Sınıf: ${u.grade || '-'}/${u.class || '-'}`,
              `  Rol: ${roles?.map(r => r.role).join(', ') || '-'}`,
              `  Doğrulanmış: ${verification?.is_verified ? '✅' : '❌'}`,
              `  İzlenen Ders: ${stats?.lessons_watched || 0}`,
              `  Ödev Teslim: ${stats?.homework_submitted || 0}`,
              `  Deneme: ${stats?.exams_completed || 0}`,
              `  Kayıt: ${new Date(u.created_at).toLocaleDateString('tr-TR')}`,
            ].join('\n'));
          }
          break;
        }

        case 'set_role': {
          if (args.length < 2) return addLine('error', 'Kullanım: set_role <isim> <rol>');
          const validRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];
          const roleName = args[args.length - 1];
          const userName = args.slice(0, -1).join(' ');
          if (!validRoles.includes(roleName)) return addLine('error', `Geçersiz rol. Geçerli roller: ${validRoles.join(', ')}`);
          const prof = await findUser(userName);
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_roles').update({ role: roleName as any }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} rolü → ${roleName}`);
          break;
        }

        case 'verify_user': {
          if (!args[0]) return addLine('error', 'Kullanım: verify_user <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_verifications').update({ is_verified: true, verified_at: new Date().toISOString(), verified_by: user?.id }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} doğrulandı ✓`);
          break;
        }

        case 'unverify_user': {
          if (!args[0]) return addLine('error', 'Kullanım: unverify_user <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_verifications').update({ is_verified: false, verified_at: null, verified_by: null }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} doğrulaması kaldırıldı ✗`);
          break;
        }

        case 'delete_user': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_user <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          await Promise.all([
            supabase.from('user_roles').delete().eq('user_id', prof.user_id),
            supabase.from('user_stats').delete().eq('user_id', prof.user_id),
            supabase.from('user_badges').delete().eq('user_id', prof.user_id),
            supabase.from('user_verifications').delete().eq('user_id', prof.user_id),
            supabase.from('video_watch_progress').delete().eq('user_id', prof.user_id),
            supabase.from('homework_submissions').delete().eq('user_id', prof.user_id),
            supabase.from('student_exam_participation').delete().eq('user_id', prof.user_id),
            supabase.from('parent_codes').delete().eq('student_user_id', prof.user_id),
          ]);
          await supabase.from('profiles').delete().eq('user_id', prof.user_id);
          addLine('success', `${prof.name} ve tüm ilişkili veriler silindi.`);
          break;
        }

        // Content management
        case 'list_lessons': {
          const { data } = await supabase.from('lessons').select('id, title, subject, content_type, created_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ders bulunamadı.');
          const table = data.map((l, i) => `  ${i + 1}. [${l.id.slice(0, 8)}] ${l.title} (${l.subject}) [${l.content_type}]`).join('\n');
          addLine('info', `Dersler:\n${table}`);
          break;
        }

        case 'list_exams': {
          const { data } = await supabase.from('trial_exams').select('id, title, exam_date, grade').order('exam_date', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Deneme bulunamadı.');
          const table = data.map((e, i) => `  ${i + 1}. [${e.id.slice(0, 8)}] ${e.title} (${e.grade}) - ${e.exam_date}`).join('\n');
          addLine('info', `Denemeler:\n${table}`);
          break;
        }

        case 'list_homework': {
          const { data } = await supabase.from('homework_assignments').select('id, title, subject, grade, due_date').order('due_date', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ödev bulunamadı.');
          const table = data.map((h, i) => `  ${i + 1}. [${h.id.slice(0, 8)}] ${h.title} (${h.subject}/${h.grade}) - Son: ${new Date(h.due_date).toLocaleDateString('tr-TR')}`).join('\n');
          addLine('info', `Ödevler:\n${table}`);
          break;
        }

        case 'list_announcements': {
          const { data } = await supabase.from('announcements').select('id, title, type, created_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Duyuru bulunamadı.');
          const table = data.map((a, i) => `  ${i + 1}. [${a.id.slice(0, 8)}] ${a.title} (${a.type}) - ${new Date(a.created_at).toLocaleDateString('tr-TR')}`).join('\n');
          addLine('info', `Duyurular:\n${table}`);
          break;
        }

        case 'delete_lesson': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_lesson <id>');
          const { data } = await supabase.from('lessons').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Ders bulunamadı.');
          await supabase.from('video_watch_progress').delete().eq('lesson_id', data.id);
          const { error } = await supabase.from('lessons').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Ders silindi: ${data.title}`);
          break;
        }

        case 'delete_exam': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_exam <id>');
          const { data } = await supabase.from('trial_exams').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Deneme bulunamadı.');
          await supabase.from('student_exam_participation').delete().eq('exam_id', data.id);
          const { error } = await supabase.from('trial_exams').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Deneme silindi: ${data.title}`);
          break;
        }

        case 'delete_homework': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_homework <id>');
          const { data } = await supabase.from('homework_assignments').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Ödev bulunamadı.');
          await supabase.from('homework_submissions').delete().eq('homework_id', data.id);
          const { error } = await supabase.from('homework_assignments').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Ödev silindi: ${data.title}`);
          break;
        }

        case 'delete_announcement': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_announcement <id>');
          const { data } = await supabase.from('announcements').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Duyuru bulunamadı.');
          const { error } = await supabase.from('announcements').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Duyuru silindi: ${data.title}`);
          break;
        }

        // Badges
        case 'list_badges': {
          const { data } = await supabase.from('badges').select('id, name, icon, category, requirement_type, requirement_value').order('category');
          if (!data?.length) return addLine('info', 'Rozet bulunamadı.');
          const table = data.map((b, i) => `  ${i + 1}. [${b.id.slice(0, 8)}] ${b.icon} ${b.name} (${b.category}) - ${b.requirement_type}:${b.requirement_value}`).join('\n');
          addLine('info', `Rozetler:\n${table}`);
          break;
        }

        case 'grant_badge': {
          if (args.length < 2) return addLine('error', 'Kullanım: grant_badge <isim> <badge_id>');
          const badgeId = args[args.length - 1];
          const userName = args.slice(0, -1).join(' ');
          const prof = await findUser(userName);
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { data: badge } = await supabase.from('badges').select('id, name').ilike('id', `${badgeId}%`).maybeSingle();
          if (!badge) return addLine('error', 'Rozet bulunamadı.');
          const { error } = await supabase.from('user_badges').insert({ user_id: prof.user_id, badge_id: badge.id });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} → ${badge.name} rozeti verildi`);
          break;
        }

        case 'revoke_badge': {
          if (args.length < 2) return addLine('error', 'Kullanım: revoke_badge <isim> <badge_id>');
          const badgeId = args[args.length - 1];
          const userName = args.slice(0, -1).join(' ');
          const prof = await findUser(userName);
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_badges').delete().eq('user_id', prof.user_id).ilike('badge_id', `${badgeId}%`);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Rozet kaldırıldı`);
          break;
        }

        case 'user_stats': {
          if (!args[0]) return addLine('error', 'Kullanım: user_stats <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', prof.user_id).maybeSingle();
          if (!stats) return addLine('info', `${prof.name} için istatistik bulunamadı.`);
          addLine('info', [
            `  ${prof.name} İstatistikleri:`,
            `  İzlenen Ders: ${stats.lessons_watched}`,
            `  Teslim Edilen Ödev: ${stats.homework_submitted}`,
            `  Tamamlanan Deneme: ${stats.exams_completed}`,
            `  Toplam İzleme (dk): ${stats.total_watch_time}`,
          ].join('\n'));
          break;
        }

        case 'reset_stats': {
          if (!args[0]) return addLine('error', 'Kullanım: reset_stats <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_stats').update({ lessons_watched: 0, homework_submitted: 0, exams_completed: 0, total_watch_time: 0 }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} istatistikleri sıfırlandı.`);
          break;
        }

        // Invite codes
        case 'list_codes': {
          const { data } = await supabase.from('admin_access_codes').select('id, code, target_name, target_role, is_used, expires_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Davet kodu bulunamadı.');
          const table = data.map((c, i) => `  ${i + 1}. [${c.id.slice(0, 8)}] ${c.code} → ${c.target_name} (${c.target_role}) ${c.is_used ? '✅ Kullanıldı' : '⏳ Bekliyor'}`).join('\n');
          addLine('info', `Davet Kodları:\n${table}`);
          break;
        }

        case 'create_code': {
          if (args.length < 2) return addLine('error', 'Kullanım: create_code <isim> <rol>');
          const validRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];
          const roleName = args[args.length - 1];
          const targetName = args.slice(0, -1).join(' ');
          if (!validRoles.includes(roleName)) return addLine('error', `Geçersiz rol.`);
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          const { error } = await supabase.from('admin_access_codes').insert({
            code,
            target_name: targetName,
            target_role: roleName as any,
            created_by: user!.id,
          });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Davet kodu oluşturuldu: ${code} → ${targetName} (${roleName})`);
          break;
        }

        case 'delete_code': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_code <id>');
          const { error } = await supabase.from('admin_access_codes').delete().ilike('id', `${args[0]}%`);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Davet kodu silindi.`);
          break;
        }

        // Page maintenance
        case 'list_maintenance': {
          const { data } = await supabase.from('page_maintenance').select('*').order('page_route');
          if (!data?.length) return addLine('info', 'Sayfa bakım kaydı bulunamadı.');
          const table = data.map(p => `  ${p.is_active ? '🔴' : '🟢'} ${p.page_route} (${p.page_name}) - ${p.message || 'Mesaj yok'}`).join('\n');
          addLine('info', `Sayfa Bakım Durumları:\n${table}`);
          break;
        }

        case 'enable_page_maintenance': {
          if (!args[0]) return addLine('error', 'Kullanım: enable_page_maintenance <route>');
          const route = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
          const { error } = await supabase.from('page_maintenance').update({ is_active: true, updated_by: user?.id }).eq('page_route', route);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${route} bakıma alındı.`);
          break;
        }

        case 'disable_page_maintenance': {
          if (!args[0]) return addLine('error', 'Kullanım: disable_page_maintenance <route>');
          const route = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
          const { error } = await supabase.from('page_maintenance').update({ is_active: false, updated_by: user?.id }).eq('page_route', route);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${route} bakımdan çıkarıldı.`);
          break;
        }

        // Broadcast notification
        case 'broadcast': {
          if (!args.length) return addLine('error', 'Kullanım: broadcast <mesaj>');
          const message = args.join(' ');
          const { error } = await supabase.from('announcements').insert({
            title: 'Sistem Bildirimi',
            content: message,
            type: 'warning',
            created_by: user!.id,
          });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Duyuru yayınlandı: "${message}"`);
          break;
        }

        // Database
        case 'count': {
          if (!args[0]) return addLine('error', 'Kullanım: count <tablo_adı>');
          if (!VALID_TABLES.includes(args[0])) return addLine('error', `Geçersiz tablo. "tables" komutuyla geçerli tabloları görebilirsiniz.`);
          const { count, error } = await supabase.from(args[0] as any).select('*', { count: 'exact', head: true });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('info', `${args[0]}: ${count} kayıt`);
          break;
        }

        case 'select': {
          if (!args[0]) return addLine('error', 'Kullanım: select <tablo_adı> [limit]');
          if (!VALID_TABLES.includes(args[0])) return addLine('error', `Geçersiz tablo. "tables" komutuyla geçerli tabloları görebilirsiniz.`);
          const limit = parseInt(args[1]) || 10;
          const { data, error } = await supabase.from(args[0] as any).select('*').limit(limit);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('info', JSON.stringify(data, null, 2));
          break;
        }

        default:
          addLine('error', `Bilinmeyen komut: "${command}". "help" yazarak komut listesini görebilirsiniz.`);
      }
    } catch (err: any) {
      addLine('error', `Beklenmeyen hata: ${err.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'info': return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-950 border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <TerminalIcon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-mono">EMG Admin Terminal v2.0</span>
        </div>
      </div>
      <div 
        className="p-4 h-[500px] overflow-y-auto font-mono text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className={`${lineColor(line.type)} whitespace-pre-wrap mb-1`}>
            {line.text}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">admin@emg $</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-200 outline-none font-mono text-sm caret-emerald-400"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </Card>
  );
};