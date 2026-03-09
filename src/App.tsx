import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (!currentSession?.user) {
        setLoading(false);
        return;
      }

      // Admin bypass
      if (currentSession.user.email === 'admin@managerloja.com') {
        setIsComplete(true);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, street, number')
        .eq('id', currentSession.user.id)
        .single();

      const complete = !!(profile?.full_name && profile?.phone && profile?.street && profile?.number);
      setIsComplete(complete);
      setLoading(false);
    };

    checkProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-xl"></div>
    </div>
  );

  const path = window.location.pathname;

  // Not logged in -> only allow these
  if (!session?.user) {
    const publicPaths = ['/login', '/forgot-password', '/reset-password', '/'];
    if (publicPaths.includes(path)) return <>{children}</>;
    return <Login />;
  }

  // Logged in but incomplete profile -> force /profile
  if (session.user && !isComplete && path !== '/profile' && session.user.email !== 'admin@managerloja.com') {
    return <Profile forced={true} />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileGuard><Home /></ProfileGuard>} />
          <Route path="/orcamento" element={<ProfileGuard><Index /></ProfileGuard>} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileGuard><Profile /></ProfileGuard>} />
          <Route path="/admin" element={<ProfileGuard><Admin /></ProfileGuard>} />
          <Route path="/pedidos" element={<ProfileGuard><Orders /></ProfileGuard>} />
          <Route path="/blog" element={<ProfileGuard><Blog /></ProfileGuard>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
