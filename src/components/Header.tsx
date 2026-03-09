import { ShoppingCart, User, LogOut, Settings, Package, Menu, X } from "lucide-react";
import logo from "@/assets/logo-manager-clean.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";

interface HeaderProps {
  cartCount: number;
  onCartToggle: () => void;
  hideOrcamento?: boolean;
  hideCart?: boolean;
}

const Header = ({ cartCount, onCartToggle, hideOrcamento = false, hideCart = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        updateUserData(session.user);
      }
    };

    const updateUserData = async (user: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      setUserData({
        name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.fullName,
        email: profile?.email || user.email
      });
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserData(session.user);
      } else {
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    toast.success("Logoff realizado com sucesso");
    navigate("/login");
  };

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-primary z-50">
      <header className="w-full">
        <div className="container mx-auto px-6 py-[15px] flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <button className="transition-transform hover:scale-105 active:scale-95">
              <img src={logo} alt="Manager Clean" className="h-[40px] md:h-[50px] object-contain drop-shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-6">
            <nav className="hidden lg:flex items-center gap-4 md:gap-6">
              <button
                onClick={() => scrollToSection("solutions")}
                className="text-primary-foreground text-[13px] font-bold tracking-wide hover:opacity-80 transition-opacity uppercase"
              >
                Soluções
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="text-primary-foreground text-[13px] font-bold tracking-wide hover:opacity-80 transition-opacity uppercase"
              >
                Sobre
              </button>

              <button
                onClick={() => scrollToSection("services")}
                className="text-primary-foreground text-[13px] font-bold tracking-wide hover:opacity-80 transition-opacity uppercase"
              >
                Serviços
              </button>

              <button
                onClick={() => scrollToSection("contact")}
                className="text-primary-foreground text-[13px] font-bold tracking-wide hover:opacity-80 transition-opacity uppercase"
              >
                Contato
              </button>

              <button
                onClick={() => navigate("/blog")}
                className="text-primary-foreground text-[13px] font-bold tracking-wide hover:opacity-80 transition-opacity uppercase"
              >
                Blog
              </button>

              {!hideOrcamento && (
                <button
                  onClick={() => navigate("/orcamento")}
                  className="bg-white hover:bg-slate-50 text-primary rounded-full px-6 py-2 shadow-lg shadow-black/10 text-[13px] font-extrabold tracking-wide transition-all uppercase"
                >
                  Orçamento
                </button>
              )}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity">
                  <User className="h-6 w-6" />
                  {userData?.name && (
                    <span className="text-sm font-medium">
                      {userData.name.split(' ')[0]}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {userData ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userData.name || "Usuário"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userData.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/pedidos")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Meus Pedidos</span>
                    </DropdownMenuItem>

                    {userData?.email === 'admin@managerloja.com' && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Painel Administrativo</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/login", { state: { from: location.pathname } })}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Fazer Login</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>


            {!hideCart && (
              <button
                onClick={() => {
                  if (onCartToggle) onCartToggle();
                  setIsCartOpen(true);
                }}
                className="relative text-primary-foreground hover:opacity-80 transition-opacity"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-primary-foreground p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden bg-primary-foreground/95 backdrop-blur-md absolute top-full left-0 w-full shadow-2xl border-t border-slate-100 animate-in slide-in-from-top duration-300 z-50">
            <nav className="flex flex-col p-6 space-y-4">
              <button
                onClick={() => { scrollToSection("solutions"); setIsMenuOpen(false); }}
                className="text-primary text-sm font-bold tracking-wide text-left uppercase py-2 border-b border-slate-100"
              >
                Soluções
              </button>
              <button
                onClick={() => { scrollToSection("about"); setIsMenuOpen(false); }}
                className="text-primary text-sm font-bold tracking-wide text-left uppercase py-2 border-b border-slate-100"
              >
                Sobre
              </button>
              <button
                onClick={() => { scrollToSection("services"); setIsMenuOpen(false); }}
                className="text-primary text-sm font-bold tracking-wide text-left uppercase py-2 border-b border-slate-100"
              >
                Serviços
              </button>
              <button
                onClick={() => { scrollToSection("contact"); setIsMenuOpen(false); }}
                className="text-primary text-sm font-bold tracking-wide text-left uppercase py-2 border-b border-slate-100"
              >
                Contato
              </button>
              <button
                onClick={() => { navigate("/blog"); setIsMenuOpen(false); }}
                className="text-primary text-sm font-bold tracking-wide text-left uppercase py-2 border-b border-slate-100"
              >
                Blog
              </button>
              {!hideOrcamento && (
                <button
                  onClick={() => { navigate("/orcamento"); setIsMenuOpen(false); }}
                  className="bg-primary text-white rounded-xl px-6 py-4 text-center text-sm font-extrabold tracking-wide uppercase shadow-lg shadow-primary/20"
                >
                  Orçamento
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
      {/* Wavy Bottom */}
      <div className="absolute top-[99%] left-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[10px] md:h-[15px] lg:h-[20px]">
          <path className="fill-primary" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Header;
