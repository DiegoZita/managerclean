import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

// Global Guard to enforce profile completion
const GlobalGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  const checkStatus = async (silent = false) => {
    if (!silent) setLoading(true);

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);

    if (!currentSession?.user) {
      setIsComplete(false);
      if (!silent) setLoading(false);
      return;
    }

    // Admin always has access
    if (currentSession.user.email === 'admin@managerloja.com') {
      setIsComplete(true);
      if (!silent) setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, phone, street, number')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile check error:", error);
        setIsComplete(false); // Keep this for explicit error handling
      } else {
        const complete = !!(
          profile?.full_name?.trim() &&
          profile?.phone?.trim() &&
          profile?.street?.trim() &&
          profile?.number?.trim()
        );
        setIsComplete(complete);
      }
    } catch (err) {
      console.error("Critical Guard error:", err);
      setIsComplete(false);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkStatus(true); // Check silently on auth change to avoid unnecessary spinners
    });
    return () => subscription.unsubscribe();
  }, []);

  const path = location.pathname;

  useEffect(() => {
    // Re-check status on path change if logged in
    if (session?.user) {
      const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/blog', '/orcamento'];
      // Only be loud about checking if we are moving to a protected route
      if (!publicPaths.includes(path) && path !== '/profile') {
        checkStatus();
      } else {
        checkStatus(true);
      }
    }
  }, [path, session?.user?.id]);

  if (loading && path !== '/login' && path !== '/profile') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  // 1. Logged in + Not Admin + Incomplete -> MUST be on /profile
  if (session?.user && session.user.email !== 'admin@managerloja.com' && !isComplete) {
    if (path !== '/profile') {
      return <Navigate to="/profile" replace />;
    }
  }

  // 2. Not Logged In -> Only public paths
  if (!session?.user) {
    const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/blog', '/orcamento'];
    if (!publicPaths.includes(path)) {
      return <Navigate to="/login" state={{ from: path }} replace />;
    }
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
        <GlobalGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orcamento" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GlobalGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
