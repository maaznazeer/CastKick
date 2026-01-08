import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LivePage from "./pages/LivePage";
import StreamPage from "./pages/StreamPage";
import VideosPage from "./pages/VideosPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import SportsPage from "./pages/SportsPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import AdminBroadcastPage from "./pages/admin/AdminBroadcastPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/streams/:id" element={<StreamPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/video/:id" element={<VideoPlayerPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/admin/broadcast/:id" element={<AdminBroadcastPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;