import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import CartSidebar from "@/components/CartSidebar";
import ServiceConfigurator from "@/components/ServiceConfigurator";
import SchedulingContent, { SchedulingData } from "@/components/SchedulingModal";
import CheckoutSummaryContent from "@/components/CheckoutSummaryModal";
import CheckoutReviewModal from "@/components/CheckoutReviewModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ServiceItem, CartItem } from "@/data/services";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"casa" | "empresa">("casa");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartKey, setCartKey] = useState<string>("managerCleanCart_guest");
  const [isInitializingCart, setIsInitializingCart] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [selectedServiceForConfig, setSelectedServiceForConfig] =
    useState<ServiceItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"scheduling" | "summary" | "review" | null>(null);
  const [schedulingData, setSchedulingData] = useState<SchedulingData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setServices(data as ServiceItem[]);
      } catch (error: any) {
        console.error("Error fetching services:", error);
        toast.error("Erro ao carregar serviços");
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        setCurrentUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setUserProfile(data);
      }

      const key = user ? `managerCleanCart_${user.id}` : "managerCleanCart_guest";
      setCartKey(key);

      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
      setIsInitializingCart(false);
    };

    fetchServices();
    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);

      const key = user ? `managerCleanCart_${user.id}` : "managerCleanCart_guest";
      setCartKey(key);

      const savedCart = localStorage.getItem(key);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitializingCart) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, cartKey, isInitializingCart]);

  const openConfigurator = (service: ServiceItem) => {
    setSelectedServiceForConfig(service);
    setShowCart(false);
  };

  const addToCartFromConfigurator = (
    service: ServiceItem,
    quantity: number,
    details: string,
    price: number,
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.service.id === service.id && item.details === details,
      );
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id && item.details === details
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { service, quantity, details, price }];
    });
    setSelectedServiceForConfig(null);
    setShowCart(true);
    toast.success("Serviço adicionado ao carrinho!");
  };

  const refreshUserProfile = async (userId?: string) => {
    const id = userId || currentUser?.id;
    if (id) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setUserProfile(data);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckoutInitiation = () => {
    if (!currentUser) {
      toast.error("Você precisa fazer login para agendar um serviço.");
      return;
    }
    setCheckoutStep("scheduling");
  };

  const handleAdvance = (data: SchedulingData) => {
    setSchedulingData(data);
    setCheckoutStep("summary");
  };

  const handleBackToScheduling = () => setCheckoutStep("scheduling");
  const handleAdvanceToReview = () => setCheckoutStep("review");
  const handleBackToSummary = () => setCheckoutStep("summary");
  const handleFinalConfirm = () => {
    setCheckoutStep(null);
    setCart([]);
  };

  const itemsForActiveTab = services.filter((s) => s.category === activeTab);
  const outrosServicos = services.filter((s) => s.category === "outros");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const customerData = userProfile ? {
    id: userProfile.id,
    address: userProfile.street,
    number: userProfile.number,
    complement: userProfile.complement,
    neighborhood: userProfile.neighborhood,
    city: userProfile.city,
    state: userProfile.state,
    zipCode: userProfile.cep,
    name: userProfile.full_name,
    phone: userProfile.phone,
    cpf: userProfile.cpf || "",
    email: userProfile.email
  } : currentUser ? {
    id: currentUser.id,
    email: currentUser.email,
    name: "", phone: "", address: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "", cpf: ""
  } : null;

  return (
    <div className="min-h-screen bg-white font-sans text-foreground selection:bg-primary/20">
      <div className="sticky top-0 z-[100] w-full">
        <Header
          cartCount={totalItems}
          onCartToggle={() => setShowCart(!showCart)}
          hideOrcamento={true}
        />
      </div>

      <div className="container mx-auto max-w-[1600px] px-6 py-12">
        <div className="flex gap-10">
          <div className="flex-1">
            <div className="mb-12 relative z-10 pt-4 text-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold tracking-[0.2em] text-cyan-500 uppercase mb-1">Serviços Premium</h4>
                  <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight">Monte seu Pedido</h2>
                </div>

                <p className="text-slate-500 max-w-2xl text-[15px] leading-relaxed mx-auto">
                  Escolha os itens que deseja limpar ou impermeabilizar e tenha o orçamento em tempo real.
                </p>

                <div className="flex flex-wrap items-center gap-4 justify-center">
                  <div className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm p-1">
                    <button
                      onClick={() => setActiveTab("casa")}
                      className={`px-8 py-3 text-[13px] font-bold tracking-wide uppercase rounded-full transition-all duration-300 ${activeTab === "casa" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"}`}
                    >
                      Domiciliar
                    </button>
                    <button
                      onClick={() => setActiveTab("empresa")}
                      className={`px-8 py-3 text-[13px] font-bold tracking-wide uppercase rounded-full transition-all duration-300 ${activeTab === "empresa" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"}`}
                    >
                      Empresarial
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loadingServices ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-muted-foreground animate-pulse">Carregando serviços...</p>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-xl font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
                  {activeTab === "casa" ? "Preferidos" : "Empresarial"}
                </h2>
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {itemsForActiveTab.map((service) => (
                    <ServiceCard key={service.id} service={service} onAdd={openConfigurator} />
                  ))}
                </div>
                {outrosServicos.length > 0 && (
                  <>
                    <h2 className="mb-6 mt-12 text-xl font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-2">
                      <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
                      Catálogo Completo
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {outrosServicos.map((service) => (
                        <ServiceCard key={service.id} service={service} onAdd={openConfigurator} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {showCart && (
            <div className="hidden lg:block lg:w-[480px] shrink-0 relative">
              <div className="fixed top-[calc(50%+40px)] translate-y-[-50%] right-6 w-[480px] z-40 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col">
                <CartSidebar
                  items={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onCheckout={handleCheckoutInitiation}
                />
              </div>
            </div>
          )}
        </div>

        <Sheet open={isMobile && showCart} onOpenChange={setShowCart}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 lg:hidden border-l-0 z-[1050]">
            <div className="h-full flex flex-col bg-slate-50">
              <div className="p-6 border-b bg-white">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">Seu Carrinho</SheetTitle>
                </SheetHeader>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CartSidebar
                  items={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onCheckout={() => {
                    setShowCart(false);
                    handleCheckoutInitiation();
                  }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Dialog.Root
        open={!!selectedServiceForConfig}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedServiceForConfig(null);
            setShowCart(true);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[1050] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-background p-0 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 outline-none h-[90vh]">
            {selectedServiceForConfig && (
              <ServiceConfigurator
                service={selectedServiceForConfig}
                isLoggedIn={!!currentUser}
                onClose={() => {
                  setSelectedServiceForConfig(null);
                  setShowCart(true);
                }}
                onAddToCart={addToCartFromConfigurator}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={checkoutStep !== null} onOpenChange={(open) => !open && setCheckoutStep(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className={`fixed left-[50%] ${checkoutStep ? 'top-0 h-full max-h-none rounded-none' : 'top-[50%] translate-y-[-50%] rounded-xl max-h-[90vh]'} z-[1050] w-[95vw] ${checkoutStep ? 'max-w-[480px]' : 'max-w-lg'} translate-x-[-50%] bg-background p-0 shadow-2xl animate-in zoom-in-95 duration-300 outline-none overflow-hidden transition-all ease-in-out`}>
            <div className="relative w-full h-full overflow-y-auto p-0">
              {checkoutStep === "scheduling" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <SchedulingContent onClose={() => setCheckoutStep(null)} onAdvance={handleAdvance} />
                </div>
              )}
              {checkoutStep === "summary" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <CheckoutSummaryContent onBack={handleBackToScheduling} onAdvance={handleAdvanceToReview} customerData={customerData} onProfileUpdate={refreshUserProfile} />
                </div>
              )}
              {checkoutStep === "review" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <CheckoutReviewModal onBack={handleBackToSummary} onFinish={handleFinalConfirm} cart={cart} customerData={customerData} schedulingData={schedulingData} />
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Index;
