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
╔══════════════════════════════════════════════════════╗
║              EMG Admin Terminal v1.0                  ║
╠══════════════════════════════════════════════════════╣
║ PLATFORM MODLARI:                                    ║
║   enable_development    - Geliştirme modunu aç       ║
║   disable_development   - Geliştirme modunu kapat    ║
║   enable_maintenance    - Bakım modunu aç            ║
║   disable_maintenance   - Bakım modunu kapat         ║
║   enable_danger          - Tehlike modunu aç          ║
║   disable_danger         - Tehlike modunu kapat       ║
║   enable_tablet          - Tablet modunu aç           ║
║   disable_tablet         - Tablet modunu kapat        ║
║                                                      ║
║ KULLANICI YÖNETİMİ:                                 ║
║   list_users             - Tüm kullanıcıları listele ║
║   user_info <email>      - Kullanıcı bilgisi         ║
║   set_role <email> <rol> - Kullanıcı rolünü değiştir ║
║   delete_user <email>    - Kullanıcıyı sil           ║
║   verify_user <email>    - Kullanıcıyı doğrula       ║
║                                                      ║
║ İÇERİK YÖNETİMİ:                                    ║
║   list_lessons           - Dersleri listele           ║
║   list_exams             - Denemeleri listele         ║
║   list_homework          - Ödevleri listele           ║
║   delete_lesson <id>     - Ders sil                  ║
║   delete_exam <id>       - Deneme sil                ║
║                                                      ║
║ VERİTABANI:                                          ║
║   count <tablo>          - Tablodaki kayıt sayısı    ║
║   select <tablo> [limit] - Tablodan veri çek         ║
║                                                      ║
║ SİSTEM:                                              ║
║   status                 - Platform durumu           ║
║   clear                  - Terminali temizle         ║
║   help                   - Bu yardım mesajı          ║
╚══════════════════════════════════════════════════════╝
`.trim();

export const AdminTerminal: React.FC = () => {
  const { user } = useAuth();
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'EMG Admin Terminal v1.0 - "help" yazarak komut listesini görebilirsiniz.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

        case 'status': {
          const { data } = await supabase.from('platform_settings').select('setting_key, setting_value');
          const modes = data?.map(s => `  ${s.setting_key}: ${s.setting_value ? '🟢 AKTİF' : '🔴 KAPALI'}`).join('\n');
          addLine('info', `Platform Durumu:\n${modes || '  Veri yok'}`);
          break;
        }

        case 'enable_development': await togglePlatformMode('development_mode', true); break;
        case 'disable_development': await togglePlatformMode('development_mode', false); break;
        case 'enable_maintenance': await togglePlatformMode('maintenance_mode', true); break;
        case 'disable_maintenance': await togglePlatformMode('maintenance_mode', false); break;
        case 'enable_danger': await togglePlatformMode('danger_detection_mode', true); break;
        case 'disable_danger': await togglePlatformMode('danger_detection_mode', false); break;
        case 'enable_tablet': await togglePlatformMode('tablet_mode', true); break;
        case 'disable_tablet': await togglePlatformMode('tablet_mode', false); break;

        case 'list_users': {
          const { data, error } = await supabase.from('profiles').select('user_id, name, school_name, class, created_at').order('created_at', { ascending: false }).limit(50);
          if (error) return addLine('error', `Hata: ${error.message}`);
          if (!data?.length) return addLine('info', 'Kullanıcı bulunamadı.');
          const table = data.map((u, i) => `  ${i + 1}. ${u.name} | ${u.school_name || '-'} | ${u.class || '-'} | ${new Date(u.created_at).toLocaleDateString('tr-TR')}`).join('\n');
          addLine('info', `Kullanıcılar (${data.length}):\n${table}`);
          break;
        }

        case 'user_info': {
          if (!args[0]) return addLine('error', 'Kullanım: user_info <isim>');
          const { data } = await supabase.from('profiles').select('*').ilike('name', `%${args[0]}%`).limit(5);
          if (!data?.length) return addLine('error', 'Kullanıcı bulunamadı.');
          for (const u of data) {
            const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', u.user_id);
            addLine('info', `  İsim: ${u.name}\n  Okul: ${u.school_name || '-'}\n  Sınıf: ${u.class || '-'}\n  Rol: ${roles?.map(r => r.role).join(', ') || '-'}\n  Kayıt: ${new Date(u.created_at).toLocaleDateString('tr-TR')}`);
          }
          break;
        }

        case 'set_role': {
          if (args.length < 2) return addLine('error', 'Kullanım: set_role <isim> <rol>');
          const validRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'];
          if (!validRoles.includes(args[1])) return addLine('error', `Geçersiz rol. Geçerli roller: ${validRoles.join(', ')}`);
          const { data: prof } = await supabase.from('profiles').select('user_id').ilike('name', `%${args[0]}%`).maybeSingle();
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_roles').update({ role: args[1] as any }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${args[0]} rolü → ${args[1]}`);
          break;
        }

        case 'verify_user': {
          if (!args[0]) return addLine('error', 'Kullanım: verify_user <isim>');
          const { data: prof } = await supabase.from('profiles').select('user_id').ilike('name', `%${args[0]}%`).maybeSingle();
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          const { error } = await supabase.from('user_verifications').update({ is_verified: true, verified_at: new Date().toISOString(), verified_by: user?.id }).eq('user_id', prof.user_id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `${args[0]} doğrulandı ✓`);
          break;
        }

        case 'delete_user': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_user <isim>');
          const { data: prof } = await supabase.from('profiles').select('user_id, name').ilike('name', `%${args[0]}%`).maybeSingle();
          if (!prof) return addLine('error', 'Kullanıcı bulunamadı.');
          // Cascade delete related data
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

        case 'list_lessons': {
          const { data } = await supabase.from('lessons').select('id, title, subject, created_at').order('created_at', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ders bulunamadı.');
          const table = data.map((l, i) => `  ${i + 1}. [${l.id.slice(0, 8)}] ${l.title} (${l.subject})`).join('\n');
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
          const { data } = await supabase.from('homework_assignments').select('id, title, subject, due_date').order('due_date', { ascending: false }).limit(20);
          if (!data?.length) return addLine('info', 'Ödev bulunamadı.');
          const table = data.map((h, i) => `  ${i + 1}. [${h.id.slice(0, 8)}] ${h.title} (${h.subject}) - Son: ${new Date(h.due_date).toLocaleDateString('tr-TR')}`).join('\n');
          addLine('info', `Ödevler:\n${table}`);
          break;
        }

        case 'delete_lesson': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_lesson <id>');
          const { data } = await supabase.from('lessons').select('id').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Ders bulunamadı.');
          const { error } = await supabase.from('lessons').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Ders silindi: ${data.id}`);
          break;
        }

        case 'delete_exam': {
          if (!args[0]) return addLine('error', 'Kullanım: delete_exam <id>');
          const { data } = await supabase.from('trial_exams').select('id').ilike('id', `${args[0]}%`).maybeSingle();
          if (!data) return addLine('error', 'Deneme bulunamadı.');
          await supabase.from('student_exam_participation').delete().eq('exam_id', data.id);
          const { error } = await supabase.from('trial_exams').delete().eq('id', data.id);
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('success', `Deneme silindi: ${data.id}`);
          break;
        }

        case 'count': {
          if (!args[0]) return addLine('error', 'Kullanım: count <tablo_adı>');
          const validTables = ['profiles', 'lessons', 'trial_exams', 'homework_assignments', 'homework_submissions', 'announcements', 'user_roles', 'user_stats', 'video_watch_progress', 'badges', 'user_badges', 'student_exam_participation', 'platform_settings', 'parent_codes', 'admin_access_codes'];
          if (!validTables.includes(args[0])) return addLine('error', `Geçersiz tablo. Geçerli tablolar:\n  ${validTables.join('\n  ')}`);
          const { count, error } = await supabase.from(args[0] as any).select('*', { count: 'exact', head: true });
          if (error) return addLine('error', `Hata: ${error.message}`);
          addLine('info', `${args[0]}: ${count} kayıt`);
          break;
        }

        case 'select': {
          if (!args[0]) return addLine('error', 'Kullanım: select <tablo_adı> [limit]');
          const validTables = ['profiles', 'lessons', 'trial_exams', 'homework_assignments', 'announcements', 'user_roles', 'platform_settings', 'badges', 'parent_codes'];
          if (!validTables.includes(args[0])) return addLine('error', `Geçersiz tablo. Geçerli tablolar:\n  ${validTables.join('\n  ')}`);
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
          <span className="text-xs text-gray-400 font-mono">EMG Admin Terminal</span>
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
