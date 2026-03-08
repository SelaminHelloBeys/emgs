import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Terminal as TerminalIcon, Lock, ShieldAlert } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'warning';
  text: string;
}

const HELP_TEXT = `
╔═══════════════════════════════════════════════════════════════╗
║                EMG Admin Terminal v3.0                         ║
╠═══════════════════════════════════════════════════════════════╣
║ PLATFORM MODLARI:                                             ║
║   enable_development / disable_development                    ║
║   enable_maintenance / disable_maintenance                    ║
║   enable_danger / disable_danger                              ║
║   enable_tablet / disable_tablet                              ║
║   set_danger_password <pw>                                    ║
║                                                               ║
║ KULLANICI YÖNETİMİ:                                          ║
║   list_users              - Tüm kullanıcıları listele         ║
║   search_users <anahtar>  - Kullanıcı ara                     ║
║   user_info <isim>        - Detaylı kullanıcı bilgisi         ║
║   user_stats <isim>       - Kullanıcı istatistikleri          ║
║   set_role <isim> <rol>   - Rol değiştir                      ║
║   verify_user <isim>      - Doğrula                           ║
║   unverify_user <isim>    - Doğrulamayı kaldır                ║
║   ⚠ delete_user <isim>   - Kullanıcı sil (ONAY GEREKLİ)     ║
║   ⚠ reset_stats <isim>   - İstatistik sıfırla (ONAY GEREKLİ)║
║                                                               ║
║ İÇERİK YÖNETİMİ:                                             ║
║   list_lessons / list_exams / list_homework / list_announcements║
║   ⚠ delete_lesson <id>   (ONAY GEREKLİ)                      ║
║   ⚠ delete_exam <id>     (ONAY GEREKLİ)                      ║
║   ⚠ delete_homework <id> (ONAY GEREKLİ)                      ║
║   ⚠ delete_announcement <id> (ONAY GEREKLİ)                  ║
║                                                               ║
║ TOPLU İŞLEMLER:                                               ║
║   bulk_badge <badge_id> <sınıf>   - Sınıfa toplu rozet ver   ║
║   bulk_notify <sınıf> <mesaj>     - Sınıfa toplu bildirim     ║
║   bulk_verify <sınıf>             - Sınıfı toplu doğrula      ║
║                                                               ║
║ ROZET:                                                        ║
║   list_badges             - Rozetleri listele                  ║
║   grant_badge <isim> <badge_id>                               ║
║   revoke_badge <isim> <badge_id>                              ║
║                                                               ║
║ DAVET KODLARI:                                                ║
║   list_codes / create_code <isim> <rol> / delete_code <id>    ║
║                                                               ║
║ SAYFA BAKIMI:                                                 ║
║   list_maintenance                                            ║
║   enable_page_maintenance <route>                             ║
║   disable_page_maintenance <route>                            ║
║                                                               ║
║ DESTEK:                                                       ║
║   list_tickets            - Destek taleplerini listele         ║
║   respond_ticket <id> <yanıt>                                 ║
║   close_ticket <id>                                           ║
║                                                               ║
║ VERİTABANI:                                                   ║
║   tables / count <tablo> / select <tablo> [limit]             ║
║                                                               ║
║ BİLDİRİM:                                                     ║
║   broadcast <mesaj>       - Genel duyuru yayınla              ║
║                                                               ║
║ SİSTEM:                                                       ║
║   status / whoami / uptime / clear / help                     ║
║                                                               ║
║ ⚠ = Bu komutlar onay gerektirir (EVET yazarak onaylayın)     ║
╚═══════════════════════════════════════════════════════════════╝
`.trim();

const VALID_TABLES = ['profiles', 'lessons', 'trial_exams', 'homework_assignments', 'homework_submissions', 'announcements', 'user_roles', 'user_stats', 'video_watch_progress', 'badges', 'user_badges', 'student_exam_participation', 'platform_settings', 'parent_codes', 'admin_access_codes', 'page_maintenance', 'user_verifications', 'teacher_parent_codes', 'support_tickets'];

const DANGEROUS_COMMANDS = ['delete_user', 'delete_lesson', 'delete_exam', 'delete_homework', 'delete_announcement', 'reset_stats'];

const TERMINAL_PASSWORD = 'emg2026';

export const AdminTerminal: React.FC = () => {
  const { user, profile } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'EMG Admin Terminal v3.0 — "help" yazarak komut listesini görebilirsiniz.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pendingConfirm, setPendingConfirm] = useState<{ cmd: string; description: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text }]);
  }, []);

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

    // Handle confirmation
    if (pendingConfirm) {
      if (trimmed.toLowerCase() === 'evet') {
        addLine('input', `$ EVET`);
        const confirmed = pendingConfirm.cmd;
        setPendingConfirm(null);
        await executeConfirmedCommand(confirmed);
      } else {
        addLine('input', `$ ${trimmed}`);
        addLine('warning', '❌ İşlem iptal edildi.');
        setPendingConfirm(null);
      }
      return;
    }

    addLine('input', `$ ${trimmed}`);
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();

    // Check if dangerous - require confirmation
    if (DANGEROUS_COMMANDS.includes(command)) {
      addLine('warning', `⚠️  TEHLİKELİ İŞLEM: "${trimmed}"\n  Bu işlem geri alınamaz! Devam etmek için EVET yazın, iptal için başka bir şey yazın.`);
      setPendingConfirm({ cmd: trimmed, description: command });
      return;
    }

    await executeConfirmedCommand(trimmed);
  };

  const executeConfirmedCommand = async (cmd: string) => {
    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help': addLine('info', HELP_TEXT); break;
        case 'clear': setLines([]); break;

        case 'whoami':
          addLine('info', `  Kullanıcı: ${profile?.name || '?'}\n  ID: ${user?.id}\n  Email: ${user?.email}`);
          break;

        case 'uptime': {
          const ms = Date.now() - startTime.current;
          addLine('info', `Terminal çalışma süresi: ${Math.floor(ms / 60000)}dk ${Math.floor((ms % 60000) / 1000)}sn`);
          break;
        }

        case 'status': {
          const { data } = await supabase.from('platform_settings').select('setting_key, setting_value');
          const modes = data?.map(s => `  ${s.setting_key}: ${s.setting_value ? '🟢 AKTİF' : '🔴 KAPALI'}`).join('\n');
          const { count: uc } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: lc } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
          const { count: tc } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
          addLine('info', `Platform Durumu:\n${modes}\n\n  Kullanıcı: ${uc} | Ders: ${lc} | Destek Talebi: ${tc}`);
          break;
        }

        case 'tables': addLine('info', `Tablolar (${VALID_TABLES.length}):\n${VALID_TABLES.map(t => `  • ${t}`).join('\n')}`); break;

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
          await supabase.from('platform_settings').update({ text_value: args[0] }).eq('setting_key', 'danger_detection_mode');
          addLine('success', 'Tehlike modu şifresi güncellendi.');
          break;
        }

        // User management
        case 'list_users': {
          const { data } = await supabase.from('profiles').select('user_id, name, school_name, class, grade, created_at').order('created_at', { ascending: false }).limit(50);
          if (!data?.length) return addLine('info', 'Kullanıcı bulunamadı.');
          addLine('info', `Kullanıcılar (${data.length}):\n${data.map((u, i) => `  ${i + 1}. ${u.name} | ${u.school_name || '-'} | ${u.grade || '-'}/${u.class || '-'}`).join('\n')}`);
          break;
        }

        case 'search_users': {
          if (!args[0]) return addLine('error', 'Kullanım: search_users <anahtar>');
          const { data } = await supabase.from('profiles').select('user_id, name, school_name, class').ilike('name', `%${args.join(' ')}%`).limit(20);
          if (!data?.length) return addLine('info', 'Kullanıcı bulunamadı.');
          addLine('info', `Sonuçlar:\n${data.map((u, i) => `  ${i + 1}. ${u.name} | ${u.school_name || '-'}`).join('\n')}`);
          break;
        }

        case 'user_info': {
          if (!args[0]) return addLine('error', 'Kullanım: user_info <isim>');
          const { data } = await supabase.from('profiles').select('*').ilike('name', `%${args.join(' ')}%`).limit(3);
          if (!data?.length) return addLine('error', 'Kullanıcı bulunamadı.');
          for (const u of data) {
            const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', u.user_id);
            const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', u.user_id).maybeSingle();
            const { data: v } = await supabase.from('user_verifications').select('is_verified').eq('user_id', u.user_id).maybeSingle();
            addLine('info', `  İsim: ${u.name}\n  ID: ${u.user_id}\n  Okul: ${u.school_name || '-'}\n  Sınıf: ${u.grade || '-'}/${u.class || '-'}\n  Rol: ${roles?.map(r => r.role).join(', ') || '-'}\n  Doğrulama: ${v?.is_verified ? '✅' : '❌'}\n  Ders: ${stats?.lessons_watched || 0} | Ödev: ${stats?.homework_submitted || 0} | Deneme: ${stats?.exams_completed || 0}`);
          }
          break;
        }

        case 'user_stats': {
          if (!args[0]) return addLine('error', 'Kullanım: user_stats <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', prof.user_id).maybeSingle();
          if (!stats) return addLine('info', `${prof.name} için istatistik yok.`);
          addLine('info', `  ${prof.name}:\n  İzlenen: ${stats.lessons_watched} | Ödev: ${stats.homework_submitted} | Deneme: ${stats.exams_completed} | Süre: ${stats.total_watch_time}dk`);
          break;
        }

        case 'set_role': {
          if (args.length < 2) return addLine('error', 'Kullanım: set_role <isim> <rol>');
          const validRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];
          const roleName = args[args.length - 1];
          if (!validRoles.includes(roleName)) return addLine('error', `Geçersiz rol. Roller: ${validRoles.join(', ')}`);
          const prof = await findUser(args.slice(0, -1).join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_roles').update({ role: roleName as any }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} → ${roleName}`);
          break;
        }

        case 'verify_user': {
          if (!args[0]) return addLine('error', 'Kullanım: verify_user <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          await supabase.from('user_verifications').update({ is_verified: true, verified_at: new Date().toISOString(), verified_by: user?.id }).eq('user_id', prof.user_id);
          addLine('success', `${prof.name} doğrulandı ✓`);
          break;
        }

        case 'unverify_user': {
          if (!args[0]) return addLine('error', 'Kullanım: unverify_user <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          await supabase.from('user_verifications').update({ is_verified: false, verified_at: null, verified_by: null }).eq('user_id', prof.user_id);
          addLine('success', `${prof.name} doğrulama kaldırıldı`);
          break;
        }

        // DANGEROUS: delete_user (already confirmed)
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
            supabase.from('support_tickets').delete().eq('user_id', prof.user_id),
          ]);
          await supabase.from('profiles').delete().eq('user_id', prof.user_id);
          addLine('success', `🗑️ ${prof.name} ve tüm verileri silindi.`);
          break;
        }

        case 'reset_stats': {
          if (!args[0]) return addLine('error', 'Kullanım: reset_stats <isim>');
          const prof = await findUser(args.join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          await supabase.from('user_stats').update({ lessons_watched: 0, homework_submitted: 0, exams_completed: 0, total_watch_time: 0 }).eq('user_id', prof.user_id);
          addLine('success', `${prof.name} istatistikleri sıfırlandı.`);
          break;
        }

        // Content lists
        case 'list_lessons': {
          const { data } = await supabase.from('lessons').select('id, title, subject, content_type').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ders yok.');
          addLine('info', `Dersler:\n${data.map((l, i) => `  ${i + 1}. [${l.id.slice(0, 8)}] ${l.title} (${l.subject})`).join('\n')}`);
          break;
        }

        case 'list_exams': {
          const { data } = await supabase.from('trial_exams').select('id, title, grade, exam_date').order('exam_date', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Deneme yok.');
          addLine('info', `Denemeler:\n${data.map((e, i) => `  ${i + 1}. [${e.id.slice(0, 8)}] ${e.title} (${e.grade})`).join('\n')}`);
          break;
        }

        case 'list_homework': {
          const { data } = await supabase.from('homework_assignments').select('id, title, subject, grade, due_date').order('due_date', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ödev yok.');
          addLine('info', `Ödevler:\n${data.map((h, i) => `  ${i + 1}. [${h.id.slice(0, 8)}] ${h.title} (${h.subject}/${h.grade})`).join('\n')}`);
          break;
        }

        case 'list_announcements': {
          const { data } = await supabase.from('announcements').select('id, title, type, created_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Duyuru yok.');
          addLine('info', `Duyurular:\n${data.map((a, i) => `  ${i + 1}. [${a.id.slice(0, 8)}] ${a.title} (${a.type})`).join('\n')}`);
          break;
        }

        // Content deletes (already confirmed)
        case 'delete_lesson': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_lesson <id>');
          const { data } = await supabase.from('lessons').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Ders bulunamadı.');
          await supabase.from('video_watch_progress').delete().eq('lesson_id', data.id);
          await supabase.from('lessons').delete().eq('id', data.id);
          addLine('success', `🗑️ Ders silindi: ${data.title}`);
          break;
        }

        case 'delete_exam': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_exam <id>');
          const { data } = await supabase.from('trial_exams').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Deneme bulunamadı.');
          await supabase.from('student_exam_participation').delete().eq('exam_id', data.id);
          await supabase.from('trial_exams').delete().eq('id', data.id);
          addLine('success', `🗑️ Deneme silindi: ${data.title}`);
          break;
        }

        case 'delete_homework': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_homework <id>');
          const { data } = await supabase.from('homework_assignments').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Ödev bulunamadı.');
          await supabase.from('homework_submissions').delete().eq('homework_id', data.id);
          await supabase.from('homework_assignments').delete().eq('id', data.id);
          addLine('success', `🗑️ Ödev silindi: ${data.title}`);
          break;
        }

        case 'delete_announcement': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_announcement <id>');
          const { data } = await supabase.from('announcements').select('id, title').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Duyuru bulunamadı.');
          await supabase.from('announcements').delete().eq('id', data.id);
          addLine('success', `🗑️ Duyuru silindi: ${data.title}`);
          break;
        }

        // BULK OPERATIONS
        case 'bulk_badge': {
          if (args.length < 2) return addLine('error', 'Kullanım: bulk_badge <badge_id> <sınıf>\n  Örn: bulk_badge abc12345 8A');
          const [badgeIdPrefix, classFilter] = args;
          const { data: badge } = await supabase.from('badges').select('id, name').ilike('id', `${badgeIdPrefix}%`).maybeSingle();
          if (!badge) return addLine('error', 'Rozet bulunamadı.');
          const { data: users } = await supabase.from('profiles').select('user_id, name').ilike('class', `%${classFilter}%`);
          if (!users?.length) return addLine('error', `"${classFilter}" sınıfında kullanıcı bulunamadı.`);
          let count = 0;
          for (const u of users) {
            const { error } = await supabase.from('user_badges').insert({ user_id: u.user_id, badge_id: badge.id });
            if (!error) count++;
          }
          addLine('success', `🏆 ${badge.name} rozeti ${count}/${users.length} kullanıcıya verildi (${classFilter}).`);
          break;
        }

        case 'bulk_notify': {
          if (args.length < 2) return addLine('error', 'Kullanım: bulk_notify <sınıf> <mesaj>\n  Örn: bulk_notify 8A Yarın sınav var!');
          const classFilter = args[0];
          const message = args.slice(1).join(' ');
          const { error } = await supabase.from('announcements').insert({
            title: `${classFilter} Sınıfı Bildirimi`,
            content: message,
            type: 'info',
            created_by: user!.id,
          });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `📢 "${classFilter}" sınıfına duyuru gönderildi: "${message}"`);
          break;
        }

        case 'bulk_verify': {
          if (!args[0]) return addLine('error', 'Kullanım: bulk_verify <sınıf>');
          const { data: users } = await supabase.from('profiles').select('user_id, name').ilike('class', `%${args[0]}%`);
          if (!users?.length) return addLine('error', `"${args[0]}" sınıfında kullanıcı bulunamadı.`);
          let count = 0;
          for (const u of users) {
            const { error } = await supabase.from('user_verifications').update({
              is_verified: true, verified_at: new Date().toISOString(), verified_by: user?.id,
            }).eq('user_id', u.user_id);
            if (!error) count++;
          }
          addLine('success', `✅ ${count}/${users.length} kullanıcı doğrulandı (${args[0]}).`);
          break;
        }

        // Badges
        case 'list_badges': {
          const { data } = await supabase.from('badges').select('id, name, icon, category').order('category');
          if (!data?.length) return addLine('info', 'Rozet yok.');
          addLine('info', `Rozetler:\n${data.map((b, i) => `  ${i + 1}. [${b.id.slice(0, 8)}] ${b.icon} ${b.name} (${b.category})`).join('\n')}`);
          break;
        }

        case 'grant_badge': {
          if (args.length < 2) return addLine('error', 'Kullanım: grant_badge <isim> <badge_id>');
          const prof = await findUser(args.slice(0, -1).join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { data: badge } = await supabase.from('badges').select('id, name').ilike('id', `${args[args.length - 1]}%`).maybeSingle();
          if (!badge) return addLine('error', 'Rozet bulunamadı.');
          const { error } = await supabase.from('user_badges').insert({ user_id: prof.user_id, badge_id: badge.id });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${prof.name} → ${badge.name} 🏆`);
          break;
        }

        case 'revoke_badge': {
          if (args.length < 2) return addLine('error', 'Kullanım: revoke_badge <isim> <badge_id>');
          const prof = await findUser(args.slice(0, -1).join(' '));
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          await supabase.from('user_badges').delete().eq('user_id', prof.user_id).ilike('badge_id', `${args[args.length - 1]}%`);
          addLine('success', 'Rozet kaldırıldı.');
          break;
        }

        // Invite codes
        case 'list_codes': {
          const { data } = await supabase.from('admin_access_codes').select('id, code, target_name, target_role, is_used').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Kod yok.');
          addLine('info', `Kodlar:\n${data.map((c, i) => `  ${i + 1}. [${c.id.slice(0, 8)}] ${c.code} → ${c.target_name} (${c.target_role}) ${c.is_used ? '✅' : '⏳'}`).join('\n')}`);
          break;
        }

        case 'create_code': {
          if (args.length < 2) return addLine('error', 'Kullanım: create_code <isim> <rol>');
          const validRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];
          const roleName = args[args.length - 1];
          if (!validRoles.includes(roleName)) return addLine('error', 'Geçersiz rol.');
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          await supabase.from('admin_access_codes').insert({ code, target_name: args.slice(0, -1).join(' '), target_role: roleName as any, created_by: user!.id });
          addLine('success', `Kod: ${code} → ${args.slice(0, -1).join(' ')} (${roleName})`);
          break;
        }

        case 'delete_code': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_code <id>');
          await supabase.from('admin_access_codes').delete().ilike('id', `${args[0]}%`);
          addLine('success', 'Kod silindi.');
          break;
        }

        // Page maintenance
        case 'list_maintenance': {
          const { data } = await supabase.from('page_maintenance').select('*').order('page_route');
          if (!data?.length) return addLine('info', 'Bakım kaydı yok.');
          addLine('info', `Bakım:\n${data.map(p => `  ${p.is_active ? '🔴' : '🟢'} ${p.page_route} (${p.page_name})`).join('\n')}`);
          break;
        }

        case 'enable_page_maintenance': {
          if (!args[0]) return addLine('error', 'Kullanım: enable_page_maintenance <route>');
          const route = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
          await supabase.from('page_maintenance').update({ is_active: true, updated_by: user?.id }).eq('page_route', route);
          addLine('success', `${route} bakıma alındı.`);
          break;
        }

        case 'disable_page_maintenance': {
          if (!args[0]) return addLine('error', 'Kullanım: disable_page_maintenance <route>');
          const route = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
          await supabase.from('page_maintenance').update({ is_active: false, updated_by: user?.id }).eq('page_route', route);
          addLine('success', `${route} bakımdan çıkarıldı.`);
          break;
        }

        // Support tickets
        case 'list_tickets': {
          const { data } = await supabase.from('support_tickets').select('id, subject, status, priority, created_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Destek talebi yok.');
          addLine('info', `Destek Talepleri:\n${data.map((t, i) => `  ${i + 1}. [${t.id.slice(0, 8)}] ${t.subject} | ${t.status} | ${t.priority}`).join('\n')}`);
          break;
        }

        case 'respond_ticket': {
          if (args.length < 2) return addLine('error', 'Kullanım: respond_ticket <id> <yanıt>');
          const ticketId = args[0];
          const response = args.slice(1).join(' ');
          const { error } = await supabase.from('support_tickets').update({ admin_response: response, status: 'resolved', responded_by: user?.id }).ilike('id', `${ticketId}%`);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', 'Talep yanıtlandı.');
          break;
        }

        case 'close_ticket': {
          if (!args[0]) return addLine('error', 'Kullanım: close_ticket <id>');
          await supabase.from('support_tickets').update({ status: 'closed' }).ilike('id', `${args[0]}%`);
          addLine('success', 'Talep kapatıldı.');
          break;
        }

        // Broadcast
        case 'broadcast': {
          if (!args.length) return addLine('error', 'Kullanım: broadcast <mesaj>');
          await supabase.from('announcements').insert({ title: 'Sistem Bildirimi', content: args.join(' '), type: 'warning', created_by: user!.id });
          addLine('success', `📢 Duyuru yayınlandı.`);
          break;
        }

        // Database
        case 'count': {
          if (!args[0]) return addLine('error', 'Kullanım: count <tablo>');
          if (!VALID_TABLES.includes(args[0])) return addLine('error', `Geçersiz tablo. "tables" ile listeleyin.`);
          const { count } = await supabase.from(args[0] as any).select('*', { count: 'exact', head: true });
          addLine('info', `${args[0]}: ${count} kayıt`);
          break;
        }

        case 'select': {
          if (!args[0]) return addLine('error', 'Kullanım: select <tablo> [limit]');
          if (!VALID_TABLES.includes(args[0])) return addLine('error', `Geçersiz tablo.`);
          const { data } = await supabase.from(args[0] as any).select('*').limit(parseInt(args[1]) || 10);
          addLine('info', JSON.stringify(data, null, 2));
          break;
        }

        default:
          addLine('error', `Bilinmeyen komut: "${command}". "help" yazın.`);
      }
    } catch (err: any) {
      addLine('error', `Hata: ${err.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        setHistoryIndex(historyIndex - 1);
        setInput(history[historyIndex - 1]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === TERMINAL_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'info': return 'text-gray-400';
    }
  };

  // Password gate
  if (!isUnlocked) {
    return (
      <Card className="bg-gray-950 border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-mono">EMG Admin Terminal — Kilitli</span>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
          <ShieldAlert className="w-12 h-12 text-amber-400" />
          <p className="text-gray-400 text-sm font-mono text-center">Terminal erişimi için şifre girin</p>
          <form onSubmit={handlePasswordSubmit} className="flex gap-2 w-full max-w-xs">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Terminal şifresi"
              className="bg-gray-900 border-gray-700 text-gray-200 font-mono text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" variant="outline" className="border-gray-700 text-gray-300">
              Giriş
            </Button>
          </form>
          {passwordError && <p className="text-red-400 text-xs font-mono">Yanlış şifre!</p>}
          <p className="text-gray-600 text-[10px] font-mono">İpucu: emg2026</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-950 border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <TerminalIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-mono">EMG Admin Terminal v3.0</span>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setIsUnlocked(false)} className="text-gray-500 text-xs h-6">
          <Lock className="w-3 h-3 mr-1" /> Kilitle
        </Button>
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
