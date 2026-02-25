import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { BadgeNotification } from "@/components/BadgeNotification";

// Pages
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { KonuAnlatimiPage } from "./pages/KonuAnlatimiPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeacherContentUploadPage } from "./pages/TeacherContentUploadPage";
import { DenemelerPage } from "./pages/DenemelerPage";
import { DenemeDetailPage } from "./pages/DenemeDetailPage";
import { BadgesPage } from "./pages/BadgesPage";
import { ModerationPage } from "./pages/ModerationPage";
import NotFound from "./pages/NotFound";

// Layout
import { AppLayout } from "./components/layout/AppLayout";
import { AICoach } from "./components/AICoach";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BadgeNotification>
              <AICoach />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/konu-anlatimi" element={<KonuAnlatimiPage />} />
                  <Route path="/quizzes" element={<QuizzesPage />} />
                  <Route path="/homework" element={<HomeworkPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/announcements" element={<AnnouncementsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/upload" element={<TeacherContentUploadPage />} />
                  <Route path="/denemeler" element={<DenemelerPage />} />
                  <Route path="/denemeler/:id" element={<DenemeDetailPage />} />
                  <Route path="/rozetler" element={<BadgesPage />} />
                  <Route path="/moderation" element={<ModerationPage />} />
                </Route>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BadgeNotification>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
