import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Eye,
  Clock,
  User,
  Search,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: number;
  title: string;
  subject: string;
  teacher: string;
  pages: number;
  size: string;
  uploadDate: string;
  downloads: number;
}

const mockDocuments: Document[] = [
  { id: 1, title: 'Türev Formülleri Özet', subject: 'Matematik', teacher: 'Ahmet Yılmaz', pages: 12, size: '2.4 MB', uploadDate: '2 gün önce', downloads: 234 },
  { id: 2, title: 'Newton Kanunları Ders Notları', subject: 'Fizik', teacher: 'Ayşe Demir', pages: 24, size: '5.1 MB', uploadDate: '1 hafta önce', downloads: 456 },
  { id: 3, title: 'Organik Kimya Bileşikleri', subject: 'Kimya', teacher: 'Mehmet Kaya', pages: 18, size: '3.8 MB', uploadDate: '3 gün önce', downloads: 189 },
  { id: 4, title: 'Osmanlı Kronolojisi', subject: 'Tarih', teacher: 'Fatma Özkan', pages: 8, size: '1.2 MB', uploadDate: '5 gün önce', downloads: 312 },
  { id: 5, title: 'İngilizce Gramer Kuralları', subject: 'İngilizce', teacher: 'John Smith', pages: 32, size: '4.5 MB', uploadDate: '1 gün önce', downloads: 567 },
  { id: 6, title: 'Biyoloji Hücre Yapısı', subject: 'Biyoloji', teacher: 'Zeynep Kaya', pages: 15, size: '6.2 MB', uploadDate: '4 gün önce', downloads: 278 },
];

const subjectColors: Record<string, string> = {
  'Matematik': 'bg-primary/10 text-primary',
  'Fizik': 'bg-apple-blue/10 text-apple-blue',
  'Kimya': 'bg-apple-green/10 text-apple-green',
  'Tarih': 'bg-apple-orange/10 text-apple-orange',
  'İngilizce': 'bg-apple-purple/10 text-apple-purple',
  'Biyoloji': 'bg-apple-teal/10 text-apple-teal',
};

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dokümanlar</h1>
          <p className="text-muted-foreground">Ders notları ve PDF materyalleri</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Doküman ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrele
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {mockDocuments.map((doc) => (
          <Card key={doc.id} variant="interactive" className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-14 rounded-lg bg-apple-red/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-apple-red" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  subjectColors[doc.subject] || 'bg-muted text-muted-foreground'
                )}>
                  {doc.subject}
                </span>
                <h3 className="font-semibold mt-2 truncate">{doc.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="w-3.5 h-3.5" /> {doc.teacher}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
              <span>{doc.pages} sayfa</span>
              <span>{doc.size}</span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> {doc.downloads}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 gap-1" size="sm">
                <Eye className="w-4 h-4" />
                Görüntüle
              </Button>
              <Button variant="apple" className="flex-1 gap-1" size="sm">
                <Download className="w-4 h-4" />
                İndir
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
