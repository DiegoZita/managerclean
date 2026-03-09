import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import {
    Laptop,
    ShoppingCart,
    Activity,
    Plane,
    Gamepad2,
    Dumbbell,
    Landmark,
    MonitorSmartphone,
    Cpu,
    BrainCircuit,
    Boxes,
    Headset,
    Cloudy,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Target,
    X,
    CheckCircle2,
    User,
    LogOut,
    Package,
    Settings,
    Menu,
    Wallet
} from "lucide-react";
import logo from "@/assets/logo-manager-clean.png";
import { supabase } from "@/lib/supabaseClient";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const HOME_SERVICES = [
    { image: "/imageService/AD-sofa.png", title: "Limpeza de Sofá" },
    { image: "/imageService/AD-img10.png", title: "Higienização Profunda" },
    { image: "/imageService/AD-img3.png", title: "Limpeza de Cadeiras" },
    { image: "/imageService/AD-img4.png", title: "Remoção de Manchas" },
    { image: "/imageService/AD-img5.png", title: "Estofados em Geral" },
    { image: "/imageService/AD-img6.png", title: "Limpeza de Colchão" },
    { image: "/imageService/AD-img8.png", title: "Tapetes e Carpetes" },
    { image: "/imageService/AD-img9.png", title: "Deixamos como novo" }
];

const Home = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState<typeof HOME_SERVICES[0] | null>(null);
    const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', session.user.id)
                    .single();
                setUserData({
                    name: profile?.full_name || session.user.user_metadata?.full_name,
                    email: profile?.email || session.user.email
                });
            }
        };
        fetchUser();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) setUserData(null);
            else fetchUser();
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserData(null);
        toast.success("Logoff realizado com sucesso");
        navigate("/login");
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        const speed = window.innerWidth < 768 ? 0.5 : 1;

        const scroll = () => {
            if (!isHovered && !isDragging && scrollRef.current) {
                scrollRef.current.scrollLeft += speed;

                const singleSetWidth = scrollRef.current.scrollWidth / 3;
                if (scrollRef.current.scrollLeft >= singleSetWidth) {
                    scrollRef.current.scrollLeft -= singleSetWidth;
                } else if (scrollRef.current.scrollLeft <= 0) {
                    scrollRef.current.scrollLeft += singleSetWidth;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };
        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered, isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
        setIsHovered(false);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        setHasDragged(true);
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging || !scrollRef.current) return;
        setHasDragged(true);
        const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const handleItemClick = useCallback((item: typeof HOME_SERVICES[0]) => {
        if (hasDragged) return;
        setSelectedService(item);
    }, [hasDragged]);

    return (
        <div className="min-h-screen bg-white font-sans text-foreground overflow-hidden relative selection:bg-primary/20">
            {/* Background Floating Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-20 left-[10%] w-4 h-4 rounded-full bg-primary/20 blur-[1px]"></div>
                <div className="absolute top-40 right-[20%] w-8 h-8 rounded-full bg-primary/30 blur-[2px]"></div>
                <div className="absolute top-[30%] left-[5%] w-6 h-6 rounded-full bg-blue-400/20 blur-[1px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-10 h-10 rounded-full bg-primary/20 blur-[2px]"></div>
                <div className="absolute top-[60%] right-[30%] w-3 h-3 rounded-full bg-blue-500/30 blur-[1px]"></div>
            </div>

            <div className="relative z-10 w-full h-full pb-8">
                {/* Navbar with Wave */}
                <div className="fixed top-0 left-0 w-full bg-primary z-50 shadow-md">
                    <header className="container mx-auto px-6 py-[15px] flex items-center justify-between">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={logo} alt="Logo" className="h-[40px] md:h-[50px] object-contain drop-shadow-sm" />
                        </div>
                        <div className="flex items-center gap-4">
                            <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wide text-white/90 uppercase">
                                <a href="#about" className="hover:text-white transition-colors drop-shadow-sm">SOBRE</a>
                                <a href="#solutions" className="hover:text-white transition-colors drop-shadow-sm">SOLUÇÕES</a>
                                <a href="#services" className="hover:text-white transition-colors drop-shadow-sm">SERVIÇOS</a>
                                <a href="#contact" className="hover:text-white transition-colors drop-shadow-sm">CONTATO</a>
                                <a href="/blog" className="hover:text-white transition-colors drop-shadow-sm">BLOG</a>
                                <Button
                                    onClick={() => navigate('/orcamento')}
                                    className="bg-white hover:bg-slate-50 text-primary rounded-full px-6 py-2 shadow-lg shadow-black/10 text-[13px] font-extrabold tracking-wide"
                                >
                                    ORÇAMENTO
                                </Button>
                            </nav>

                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                                            <User className="h-6 w-6" />
                                            {userData?.name && (
                                                <span className="text-sm font-semibold hidden sm:inline">
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
                                            <DropdownMenuItem onClick={() => navigate("/login")}>
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Fazer Login</span>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="lg:hidden text-white p-1 hover:bg-white/10 rounded-md transition-colors"
                                >
                                    {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                                </button>
                            </div>
                        </div>
                    </header>
                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <div className="lg:hidden bg-primary shadow-2xl border-t border-white/10 animate-in slide-in-from-top duration-300">
                            <nav className="flex flex-col p-6 space-y-4">
                                <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-white text-sm font-bold tracking-wide uppercase py-2 border-b border-white/5">SOBRE</a>
                                <a href="#solutions" onClick={() => setIsMenuOpen(false)} className="text-white text-sm font-bold tracking-wide uppercase py-2 border-b border-white/5">SOLUÇÕES</a>
                                <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-white text-sm font-bold tracking-wide uppercase py-2 border-b border-white/5">SERVIÇOS</a>
                                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-white text-sm font-bold tracking-wide uppercase py-2 border-b border-white/5">CONTATO</a>
                                <a href="/blog" onClick={() => setIsMenuOpen(false)} className="text-white text-sm font-bold tracking-wide uppercase py-2 border-b border-white/5">BLOG</a>
                                <Button
                                    onClick={() => { navigate('/orcamento'); setIsMenuOpen(false); }}
                                    className="bg-white text-primary hover:bg-slate-50 rounded-full px-6 py-4 text-[13px] font-extrabold tracking-wide uppercase shadow-lg shadow-black/10"
                                >
                                    ORÇAMENTO
                                </Button>
                            </nav>
                        </div>
                    )}
                    {/* Wavy Bottom */}
                    <div className="absolute top-[99%] left-0 w-full overflow-hidden leading-none pointer-events-none">
                        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[10px] md:h-[15px] lg:h-[20px]">
                            <path className="fill-primary" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="container mx-auto px-6 pt-28 pb-32 flex flex-col-reverse lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 space-y-8 relative z-10">
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-800 tracking-tight">
                            Seu sofá merece <br /> um cuidado <br /> profissional.
                        </h1>
                        <div className="space-y-4">

                            <p className="text-slate-500 max-w-md leading-relaxed text-lg">
                                Deixe seu estofado limpo, cheiroso e renovado com a higienização profissional da Manager Clean.
                            </p>
                        </div>
                        <div>
                            <Button
                                onClick={() => navigate('/orcamento')}
                                className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-[15px] font-bold tracking-wide shadow-xl shadow-primary/30 mt-4"
                            >
                                SOLICITAR
                            </Button>
                        </div>
                    </div>
                    <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
                        <div className="relative w-full aspect-square max-w-[600px] hover:scale-[1.02] transition-transform duration-700">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-200/40 rounded-full blur-3xl opacity-60"></div>
                            {/* 3D-ish composition of laptops/phones can be mimicked using layered divs */}
                            <div className="relative w-full h-full flex items-center justify-center -rotate-6">
                                <div className="bg-slate-800 border-[12px] border-slate-900 rounded-2xl w-[80%] h-[60%] shadow-2xl absolute z-10 overflow-hidden flex flex-col">
                                    {/* Laptop Screen mock */}
                                    <div className="bg-slate-900 w-full h-12 flex items-center px-4 border-b border-slate-700">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 grid grid-cols-3 gap-4 bg-slate-800">
                                        <div className="col-span-2 space-y-4">
                                            <div className="h-24 bg-primary/20 rounded-lg"></div>
                                            <div className="h-8 bg-slate-700 rounded-lg"></div>
                                            <div className="h-8 bg-slate-700 rounded-lg w-2/3"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-10 bg-blue-500/20 rounded-lg"></div>
                                            <div className="h-10 bg-blue-500/20 rounded-lg"></div>
                                            <div className="h-10 bg-blue-500/20 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Keyboard base mock */}
                                <div className="bg-slate-300 rounded-b-xl w-[90%] h-8 absolute bottom-[15%] z-0 shadow-lg translate-y-full skew-x-12"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solutions Grid */}
                <section id="solutions" className="container mx-auto px-6 py-24 relative z-10">
                    <div className="mb-16 max-w-3xl">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-4">Soluções Completas em Higienização</h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Conheça nossos serviços profissionais para estofados, veículos e ambientes, garantindo mais limpeza, proteção e bem-estar para o seu dia a dia.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {[
                            { imageIcon: "/spray-icon.png", title: "Higienização", desc: "Limpeza profunda que remove sujeiras, ácaros, bactérias e odores de sofás, colchões e poltronas, deixando o estofado renovado e mais higienizado." },
                            { imageIcon: "/impermeabilizacao-icon.png", title: "Impermeabilização", desc: "Proteção contra líquidos e manchas, criando uma barreira no tecido que aumenta a durabilidade e facilita a limpeza do estofado." },
                            { imageIcon: "/odor-control-icon.png", title: "Pet Odor Control", desc: "Processo de higienização que remove odores de urina e fezes de pets, deixando o estofado limpo, higienizado e renovado." },
                            { imageIcon: "/ac-icon.png", title: "Ar-Condicionado", desc: "Eliminamos poeira, fungos e bactérias do sistema, melhorando a qualidade do ar e o desempenho do equipamento." },
                            { imageIcon: "/car-clean-icon.png", title: "Higienização de Automóvel", desc: "Limpeza completa dos estofados e interior do veículo, removendo sujeiras, manchas e odores para um carro mais limpo e agradável." },
                            { imageIcon: "/praticidade-icon.png", title: "Praticidade", desc: "Mais praticidade no seu dia a dia. Você solicita o serviço e nossa equipe realiza toda a higienização no local, com rapidez, cuidado e comodidade." }
                        ].map((item: any, i) => (
                            <div key={i} className="flex gap-5 group">
                                <div className="shrink-0 mt-1">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300 text-primary group-hover:text-white overflow-hidden p-2">
                                        {item.imageIcon ? (
                                            <img src={item.imageIcon} alt={item.title} className="w-6 h-6 object-contain group-hover:brightness-0 group-hover:invert transition-all" />
                                        ) : (
                                            item.icon && <item.icon className="w-5 h-5" strokeWidth={2} />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[15px] mb-3 text-slate-800 uppercase">{item.title}</h3>
                                    <p className="text-[15px] text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Wavy Divider */}
                <div className="w-full relative h-[100px] overflow-hidden">
                    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute w-full h-full bottom-0 left-0">
                        <path className="fill-primary" fillOpacity="1" d="M0,224L48,229.3C96,235,192,245,288,245.3C384,245,480,235,576,213.3C672,192,768,160,864,165.3C960,171,1056,213,1152,229.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Our Clients Section */}
                <section className="bg-primary py-12 relative px-6 z-10 w-full">
                    <div className="container mx-auto">

                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-8">Fácil, Rápido e Seguro!</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Enhanced Mockup Image Area */}
                            <div className="flex items-center justify-center relative group py-6 mt-0">
                                {/* Background Design Elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700"></div>
                                <div className="absolute top-[20%] left-[20%] w-4 h-4 rounded-full bg-white/40 blur-[1px] animate-pulse"></div>
                                <div className="absolute bottom-[30%] right-[25%] w-3 h-3 rounded-full bg-cyan-300/30 blur-[2px] animate-bounce duration-[3s]"></div>

                                <img
                                    src="/mockup-celular.png"
                                    alt="Mockup Celular"
                                    className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] hover:scale-110 -rotate-3 hover:rotate-0 transition-all duration-700 relative z-10"
                                />
                            </div>

                            <div className="space-y-6">
                                {/* Card 1 - Cyan */}
                                <div className="bg-cyan-600/50 backdrop-blur-md border border-cyan-400/30 p-8 rounded-2xl text-white hover:bg-cyan-600/70 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                                        <div className="w-12 h-12 bg-cyan-400/30 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-white/60 mb-1 uppercase">Praticidade</p>
                                            <h3 className="font-extrabold mb-2 text-lg leading-tight uppercase">Agendamento Rápido</h3>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">Escolha o melhor dia e horário diretamente pelo nosso site em poucos cliques.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 - White */}
                                <div className="bg-white p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                                        <div className="w-12 h-12 shadow-md bg-white rounded-full flex items-center justify-center shrink-0 text-primary border border-slate-100">
                                            <Headset className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-1 uppercase">Atendimento</p>
                                            <h3 className="font-extrabold mb-2 text-lg text-slate-800 leading-tight uppercase">Suporte Exclusivo</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">Atendimento 100% humano, com nossa equipe pronta para te auxiliar em cada etapa.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 - Cyan */}
                                <div className="bg-cyan-600/50 backdrop-blur-md border border-cyan-400/30 p-8 rounded-2xl text-white hover:bg-cyan-600/70 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                                        <div className="w-12 h-12 bg-cyan-400/30 rounded-full flex items-center justify-center shrink-0">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-white/60 mb-1 uppercase">Confiança</p>
                                            <h3 className="font-extrabold mb-2 text-lg leading-tight uppercase">Pagamento após conclusão</h3>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">Para sua total segurança, o pagamento é realizado apenas após a conclusão do serviço.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Wavy Divider Bottom */}
                <div className="w-full relative h-[100px] overflow-hidden bg-primary z-0">
                    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute w-full h-full top-0 left-0">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,144C384,128,480,64,576,64C672,64,768,128,864,160C960,192,1056,192,1152,165.3C1248,139,1344,85,1392,58.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                {/* About Us */}
                <section id="about" className="container mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16 relative z-10 w-full mt-[-60px]">
                    <div className="md:w-[45%]">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-8">Sobre Nós</h2>
                        <div className="text-slate-500 mb-10 leading-relaxed text-[15px] space-y-4">
                            <p>A Manager Clean é uma empresa especializada em higienização e impermeabilização de estofados, oferecendo soluções profissionais para quem busca mais limpeza, conforto e saúde dentro de casa ou no ambiente de trabalho.</p>
                            <p>Nosso trabalho vai muito além de uma limpeza superficial. Utilizamos equipamentos profissionais e produtos específicos para cada tipo de tecido, garantindo uma higienização profunda capaz de remover sujeiras acumuladas, ácaros, bactérias e odores indesejados.</p>
                            <p>Nosso compromisso é entregar um serviço de alta qualidade, com atenção aos detalhes, cuidado com o ambiente do cliente e total transparência no atendimento.</p>
                        </div>
                        <div className="mb-10 pl-6 border-l-2 border-primary">
                            <h3 className="font-extrabold text-sm mb-4 text-slate-700 tracking-wider">NOSSOS VALORES</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-slate-600 text-[14px] font-medium">
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Compromisso com a qualidade</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Honestidade e transparência</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Pontualidade no atendimento</li>
                                </ul>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Respeito ao ambiente do cliente</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Uso de produtos seguros</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Atendimento profissional e personalizado</li>
                                </ul>
                            </div>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-[13px] font-bold tracking-wider shadow-lg shadow-primary/30">
                            SABER MAIS
                        </Button>
                    </div>
                    <div className="md:w-[55%] flex justify-center mt-12 md:mt-0 relative">
                        <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl scale-75 opacity-70"></div>
                        {/* Highlights Image */}
                        <div className="relative w-full aspect-square max-w-[650px] scale-110 lg:scale-[1.15]">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-primary/30 to-blue-200/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                            {/* Animated Background Shapes */}
                            <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-400/20 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                            <div className="absolute bottom-[20%] right-[15%] w-[40%] h-[40%] bg-primary/20 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>

                            {/* Main Image Container */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src="/hero-image.png"
                                    alt="Higienização profissional"
                                    className="w-[105%] h-auto object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section id="services" className="bg-slate-50 py-32 mt-12 relative">
                    <div className="container mx-auto px-6 mb-16">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-4">Serviços</h2>
                        <p className="text-slate-500 max-w-2xl leading-relaxed text-[15px] mb-6">
                            A higienização de estofados vai muito além da limpeza superficial. Nosso processo remove sujeira profunda, elimina odores e devolve o aspecto renovado ao tecido.
                        </p>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-[13px] font-bold tracking-wider shadow-lg shadow-primary/30">
                            CUIDADOS
                        </Button>
                    </div>

                    <div className="w-full relative overflow-hidden group py-8 -mt-8">

                        <div
                            ref={scrollRef}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleMouseUp}
                            onTouchMove={handleTouchMove}
                            className={`flex w-full gap-6 overflow-x-auto select-none pb-4 pt-4 px-6 ${isDragging ? "cursor-grabbing" : "cursor-grab"} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
                        >
                            {[...HOME_SERVICES, ...HOME_SERVICES, ...HOME_SERVICES].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleItemClick(item)}
                                    className={`w-[280px] shrink-0 aspect-[4/3] rounded-2xl overflow-hidden relative transition-all duration-300 shadow-lg cursor-pointer ${!isDragging ? "hover:shadow-2xl hover:-translate-y-2" : ""}`}
                                >
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110 pointer-events-none" style={{ backgroundImage: `url(${item.image})` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Dialog.Root open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-transparent p-0 outline-none flex items-center justify-center pointer-events-none">
                            {selectedService && (
                                <div className="pointer-events-auto w-full group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-3xl text-center transform scale-100 transition-all shadow-[0_0_80px_rgba(0,180,216,0.3)] animate-in zoom-in-95 duration-300">
                                    <button onClick={() => setSelectedService(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="w-full h-64 md:h-80 mx-auto rounded-xl overflow-hidden mb-2 shadow-2xl relative">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-105" style={{ backgroundImage: `url(${selectedService.image})` }}></div>
                                    </div>
                                </div>
                            )}
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Footer */}
                <footer id="contact" className="bg-white pt-24 pb-12 w-full">
                    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-slate-100 pb-16">
                        <div className="lg:w-1/2 text-center lg:text-left">

                            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-8">
                                Tem alguma <span className="text-primary italic">dúvida</span> ou pergunta?
                            </h2>
                            <Button onClick={() => window.open('https://wa.me/5511944816323', '_blank')} className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-[13px] font-bold tracking-wider shadow-lg shadow-primary/30">
                                FALE CONOSCO
                            </Button>
                        </div>

                        <div className="lg:w-1/3 text-center lg:text-right space-y-4">
                            <a href="mailto:hello@managerloja.com" className="block text-xl md:text-2xl font-bold text-slate-700 hover:text-primary transition-colors">hello@managerloja.com</a>
                            <a href="tel:+5511944816323" className="block text-lg font-bold text-primary">+55 11 94481-6323</a>

                            <div className="flex gap-4 justify-center lg:justify-end pt-6">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Facebook className="w-4 h-4" /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Twitter className="w-4 h-4" /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Instagram className="w-4 h-4" /></a>
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
        </div>
    );
};

export default Home;
