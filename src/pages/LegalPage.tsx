import React from 'react';
import { Link, useParams } from 'react-router-dom';

const UPDATED = '4 Ekim 2026';

const docs: Record<string, { title: string; sections: [string, string][] }> = {
  gizlilik: {
    title: 'Gizlilik Politikası (KVKK Aydınlatma Metni)',
    sections: [
      ['Topladığımız veriler', 'Yalnızca hizmet için gerekli olanları: ad, e-posta, okul, sınıf, rol; ödev, deneme ve video ilerleme kayıtları. Konum, rehber, reklam kimliği gibi veriler toplanmaz.'],
      ['Kullanım amacı', 'Hesabınızı oluşturmak, eğitim içeriği sunmak, öğretmen ve velinizle ilerleme paylaşmak. Verileriniz satılmaz ve reklam amacıyla kullanılmaz.'],
      ['Üçüncü taraflar', 'Reklam veya izleme SDK\'sı kullanılmaz. Veriler yalnızca barındırma ve kimlik doğrulama altyapısında, şifreli bağlantı üzerinden saklanır.'],
      ['Çocukların verileri', '13 yaş altı kullanıcılar platformu kullanamaz. 13-18 yaş arası öğrenciler için veli onayı gerekir; veli, Ayarlar üzerinden çocuğun ilerlemesini görebilir.'],
      ['Haklarınız', 'KVKK m.11 kapsamında verilerinize erişme, düzeltme ve silinmesini isteme hakkınız vardır. Ayarlar > Destek ve Veri bölümünden silme talebi oluşturabilirsiniz; talepler 30 gün içinde sonuçlandırılır.'],
      ['Saklama süresi', 'Hesap silindiğinde ilişkili tüm kayıtlar (ilerleme, rozet, ödev teslimleri) kalıcı olarak silinir.'],
    ],
  },
  'kullanim-sartlari': {
    title: 'Kullanım Şartları',
    sections: [
      ['Hizmet', 'EMG, okul içi eğitim içeriği, ödev ve deneme takibi sunan bir platformdur. Hizmet "olduğu gibi" sunulur; sınav başarısı garanti edilmez.'],
      ['Hesap', 'Bilgilerinizin doğruluğundan ve şifrenizin gizliliğinden siz sorumlusunuz. Başkası adına hesap açılamaz.'],
      ['Kabul edilemez kullanım', 'Telif hakkı ihlali, taciz, sistemin güvenliğini aşma girişimi ve otomatik veri toplama yasaktır. İhlalde hesap askıya alınabilir.'],
      ['İçerik hakları', 'Yüklenen ders içeriklerinin hakları sahiplerine aittir. Telif şikayetleri için Ayarlar > Destek üzerinden bildirim yapabilirsiniz.'],
      ['Değişiklikler', 'Şartlar güncellendiğinde bu sayfadaki tarih değiştirilir.'],
    ],
  },
  iade: {
    title: 'İade Politikası',
    sections: [
      ['Mevcut durum', 'Platform şu anda tamamen ücretsizdir; herhangi bir ödeme alınmamaktadır.'],
      ['Gelecekte ücretli planlar', 'Ücretli bir plan sunulursa, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında 14 günlük cayma hakkı tanınacak ve tüm ücretler satın alma öncesinde açıkça gösterilecektir. Gizli ücret uygulanmaz.'],
    ],
  },
  cerezler: {
    title: 'Çerez Politikası',
    sections: [
      ['Zorunlu', 'Oturumunuzu açık tutmak ve tema tercihinizi hatırlamak için tarayıcı depolaması kullanılır. Bunlar olmadan giriş yapılamaz.'],
      ['Analitik / Pazarlama', 'Kullanılmaz. Reklam veya izleme çerezi yoktur.'],
      ['Tercihinizi değiştirme', 'Çerez tercihinizi sıfırlamak için tarayıcı verilerinizi temizleyebilirsiniz.'],
    ],
  },
};

export const LegalPage: React.FC = () => {
  const { slug = 'gizlilik' } = useParams();
  const doc = docs[slug] ?? docs.gizlilik;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <nav className="flex flex-wrap gap-3 text-sm mb-8">
          {Object.entries(docs).map(([k, d]) => (
            <Link key={k} to={`/yasal/${k}`} className={k === slug ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>
              {d.title.split(' (')[0]}
            </Link>
          ))}
        </nav>
        <h1 className="text-2xl font-bold mb-1">{doc.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">Son güncelleme: {UPDATED}</p>
        <div className="space-y-6">
          {doc.sections.map(([h, t]) => (
            <section key={h}>
              <h2 className="font-semibold mb-1">{h}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t}</p>
            </section>
          ))}
        </div>
        <Link to="/auth" className="inline-block mt-10 text-sm underline">Geri dön</Link>
      </div>
    </div>
  );
};
