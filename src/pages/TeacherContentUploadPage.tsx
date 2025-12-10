import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  PlayCircle,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

const subjects = [
  'Matematik',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Türkçe',
  'Edebiyat',
  'Tarih',
  'Coğrafya',
  'İngilizce',
  'Almanca',
  'Felsefe',
  'Din Kültürü',
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TeacherContentUploadPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');
  
  // Video lesson state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoSubject, setVideoSubject] = useState('');
  const [videoFile, setVideoFile] = useState<UploadedFile | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  // Shorts state
  const [shortTitle, setShortTitle] = useState('');
  const [shortSubject, setShortSubject] = useState('');
  const [shortFile, setShortFile] = useState<UploadedFile | null>(null);
  const [shortUploading, setShortUploading] = useState(false);
  const [shortSuccess, setShortSuccess] = useState(false);

  // PDF state
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<UploadedFile | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<UploadedFile | null>>,
    acceptedTypes: string[]
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && acceptedTypes.some(type => file.type.includes(type) || file.name.endsWith(type))) {
      setFile({ name: file.name, size: file.size, type: file.type });
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<UploadedFile | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile({ name: file.name, size: file.size, type: file.type });
    }
  };

  const simulateUpload = (
    setUploading: React.Dispatch<React.SetStateAction<boolean>>,
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  const handleVideoUpload = () => {
    if (videoTitle && videoSubject && videoFile) {
      simulateUpload(setVideoUploading, setVideoSuccess);
    }
  };

  const handleShortUpload = () => {
    if (shortTitle && shortSubject && shortFile) {
      simulateUpload(setShortUploading, setShortSuccess);
    }
  };

  const handlePdfUpload = () => {
    if (pdfTitle && pdfFile) {
      simulateUpload(setPdfUploading, setPdfSuccess);
    }
  };

  const DropZone = ({
    file,
    setFile,
    accept,
    acceptedTypes,
    icon: Icon,
    description,
  }: {
    file: UploadedFile | null;
    setFile: React.Dispatch<React.SetStateAction<UploadedFile | null>>;
    accept: string;
    acceptedTypes: string[];
    icon: React.ElementType;
    description: string;
  }) => (
    <div
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
        file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface-secondary"
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleFileDrop(e, setFile, acceptedTypes)}
    >
      {file ? (
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFile(null)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Kaldır
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-muted mx-auto flex items-center justify-center">
            <Icon className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Dosyayı buraya sürükleyin</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <label>
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileSelect(e, setFile)}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">Dosya Seç</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">İçerik Yükle</h1>
        <p className="text-muted-foreground">Video ders, shorts veya doküman yükleyin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="video" className="gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video Ders</span>
          </TabsTrigger>
          <TabsTrigger value="short" className="gap-2">
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Shorts</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </TabsTrigger>
        </TabsList>

        {/* Video Lesson Upload */}
        <TabsContent value="video" className="mt-6 space-y-6">
          <Card variant="elevated" className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ders Başlığı</label>
                <Input
                  placeholder="Örn: Türev ve İntegral - Temel Kavramlar"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Açıklama</label>
                <Textarea
                  placeholder="Dersin kısa açıklamasını yazın..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ders</label>
                <Select value={videoSubject} onValueChange={setVideoSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ders seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Video Dosyası</label>
                <DropZone
                  file={videoFile}
                  setFile={setVideoFile}
                  accept=".mp4,.mov"
                  acceptedTypes={['video/mp4', 'video/quicktime', '.mp4', '.mov']}
                  icon={Video}
                  description="MP4 veya MOV formatında"
                />
              </div>
            </div>

            {videoSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-green/10 text-apple-green">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Video başarıyla yüklendi!</p>
              </div>
            )}

            <Button
              variant="apple"
              className="w-full gap-2"
              disabled={!videoTitle || !videoSubject || !videoFile || videoUploading}
              onClick={handleVideoUpload}
            >
              {videoUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Video Yükle
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* Shorts Upload */}
        <TabsContent value="short" className="mt-6 space-y-6">
          <Card variant="elevated" className="p-6 space-y-6">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-orange/10 text-apple-orange mb-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">Shorts videoları maksimum 60 saniye olmalıdır</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Başlık</label>
                <Input
                  placeholder="Kısa ve dikkat çekici bir başlık"
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ders</label>
                <Select value={shortSubject} onValueChange={setShortSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ders seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Video Dosyası</label>
                <DropZone
                  file={shortFile}
                  setFile={setShortFile}
                  accept=".mp4,.mov"
                  acceptedTypes={['video/mp4', 'video/quicktime', '.mp4', '.mov']}
                  icon={PlayCircle}
                  description="Dikey video, max 60 saniye"
                />
              </div>
            </div>

            {shortSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-green/10 text-apple-green">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Shorts başarıyla yüklendi!</p>
              </div>
            )}

            <Button
              variant="apple"
              className="w-full gap-2"
              disabled={!shortTitle || !shortSubject || !shortFile || shortUploading}
              onClick={handleShortUpload}
            >
              {shortUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Shorts Yükle
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* PDF Upload */}
        <TabsContent value="pdf" className="mt-6 space-y-6">
          <Card variant="elevated" className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Doküman Başlığı</label>
                <Input
                  placeholder="Örn: Trigonometri Formül Kitapçığı"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Açıklama (Opsiyonel)</label>
                <Textarea
                  placeholder="Doküman hakkında kısa bilgi..."
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">PDF Dosyası</label>
                <DropZone
                  file={pdfFile}
                  setFile={setPdfFile}
                  accept=".pdf"
                  acceptedTypes={['application/pdf', '.pdf']}
                  icon={FileText}
                  description="PDF formatında"
                />
              </div>
            </div>

            {pdfSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-green/10 text-apple-green">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">PDF başarıyla yüklendi!</p>
              </div>
            )}

            <Button
              variant="apple"
              className="w-full gap-2"
              disabled={!pdfTitle || !pdfFile || pdfUploading}
              onClick={handlePdfUpload}
            >
              {pdfUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  PDF Yükle
                </>
              )}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
