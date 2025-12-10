import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { ShortsPage } from "./pages/ShortsPage";
import { LessonsPage } from "./pages/LessonsPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SmartboardPage } from "./pages/SmartboardPage";
import { TeacherContentUploadPage } from "./pages/TeacherContentUploadPage";
import NotFound from "./pages/NotFound";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* App Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shorts" element={<ShortsPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/homework" element={<HomeworkPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/smartboard" element={<SmartboardPage />} />
              <Route path="/upload" element={<TeacherContentUploadPage />} />
              
              {/* Placeholder routes for other features */}
              <Route path="/my-classes" element={<Dashboard />} />
              <Route path="/student-tracking" element={<Dashboard />} />
              <Route path="/users" element={<Dashboard />} />
              <Route path="/schools" element={<Dashboard />} />
              <Route path="/moderation" element={<Dashboard />} />
              <Route path="/school-management" element={<Dashboard />} />
            </Route>
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
