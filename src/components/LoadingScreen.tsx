import React, { useEffect, useState } from "react";
import logo from "@/assets/logo-manager-clean.png";

const LoadingScreen = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Background Decorative Glows - Soft Primary Colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Centered Content */}
      <div className="relative flex flex-col items-center">
        {/* Logo - Larger and Free-standing */}
        <div className="relative mb-12 animate-floating">
          <img 
            src={logo} 
            alt="Manager Clean Logo" 
            className="w-64 md:w-80 h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.05)]" 
          />
        </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center">
          <p className="text-slate-400 font-bold text-[11px] tracking-[0.5em] uppercase mb-6 ml-1">
            Iniciando{dots}
          </p>

          {/* Minimalist Progress Bar */}
          <div className="w-56 h-[2px] bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.4)] animate-loading-progress" />
          </div>
        </div>
      </div>

      {/* Brand Attribution */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-30">
        <div className="h-[1px] w-12 bg-slate-300"></div>
        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-slate-500">
          MANAGER CLEAN
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
