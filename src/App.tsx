import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccueilPage from "./pages/AccueilPage";
import PlanificateurPage from "./pages/PlanificateurPage";
import CerclePage from "./pages/CerclePage";
import FavorisPage from "./pages/FavorisPage";
import RecitsPage from "./pages/RecitsPage";
import EmotionsPage from "./pages/EmotionsPage";
import RappelsPage from "./pages/RappelsPage";
import RamadanPage from "./pages/RamadanPage";
import AdminPage from "./pages/AdminPage";
import ProfilPage from "./pages/ProfilPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/accueil" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected Routes */}
      <Route path="/accueil" element={<ProtectedRoute><AccueilPage /></ProtectedRoute>} />
      <Route path="/planificateur" element={<ProtectedRoute><PlanificateurPage /></ProtectedRoute>} />
      <Route path="/cercle" element={<ProtectedRoute><CerclePage /></ProtectedRoute>} />
      <Route path="/favoris" element={<ProtectedRoute><FavorisPage /></ProtectedRoute>} />
      <Route path="/recits" element={<ProtectedRoute><RecitsPage /></ProtectedRoute>} />
      <Route path="/emotions" element={<ProtectedRoute><EmotionsPage /></ProtectedRoute>} />
      <Route path="/rappels" element={<ProtectedRoute><RappelsPage /></ProtectedRoute>} />
      <Route path="/ramadan" element={<ProtectedRoute><RamadanPage /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
