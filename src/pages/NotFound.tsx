import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <AlertTriangle className="w-12 h-12" />
        </div>

        <h1 className="text-8xl font-black text-slate-800 tracking-tighter">404</h1>

        <div className="space-y-4 max-w-lg">
          <h2 className="text-3xl font-extrabold text-slate-800 uppercase italic">Página Não Encontrada</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-white font-black px-6 py-2 rounded-lg text-sm uppercase tracking-widest shadow-xl shadow-primary/30">
              Em Manutenção!
            </span>
          </div>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-12 py-7 text-[15px] font-bold tracking-wide shadow-xl shadow-primary/30 mt-8"
        >
          VOLTAR PARA A HOME
        </Button>
      </main>

      {/* Simple Footer to match style */}
      <footer className="bg-white pt-24 pb-12 w-full mt-auto">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-slate-100 pb-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800">
              Tem alguma <span className="text-primary italic">dúvida</span>?
            </h2>
          </div>

          <div className="lg:w-1/3 text-center lg:text-right space-y-4">
            <div className="flex gap-4 justify-center lg:justify-end">
              <a href="https://www.facebook.com/managerclean?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Twitter className="w-4 h-4" /></a>
              <a href="https://www.instagram.com/managerclean/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-400 font-medium">
          <p>© 2026 Manager Clean. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/404" className="hover:text-primary transition-colors">Termos</a>
            <a href="/404" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
