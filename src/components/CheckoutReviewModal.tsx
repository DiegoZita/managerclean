import { ArrowLeft, ShoppingCart, CheckCircle2, User, MapPin, Phone, Ticket, X, Check } from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/data/services";
import { SchedulingData } from "@/components/SchedulingModal";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface CheckoutReviewModalProps {
    onBack: () => void;
    onFinish: () => void;
    cart: CartItem[];
    customerData: any;
    schedulingData: SchedulingData | null;
}

const CheckoutReviewModal = ({ onBack, onFinish, cart, customerData, schedulingData }: CheckoutReviewModalProps) => {
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastWhatsappUrl, setLastWhatsappUrl] = useState("");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const minOrderValue = 150;
    const isMinApplied = subtotal < 149 && subtotal > 0;
    const baseTotal = isMinApplied ? minOrderValue : subtotal;

    // Calculate dynamic total based on coupon
    const calculateAdjustment = () => {
        if (!appliedCoupon) return 0;
        const { discount_type, discount_value } = appliedCoupon;

        if (discount_type === 'fixed') return -discount_value;
        if (discount_type === 'percentage') return -(baseTotal * (discount_value / 100));
        if (discount_type === 'fixed_increase') return discount_value;
        if (discount_type === 'percentage_increase') return (baseTotal * (discount_value / 100));
        return 0;
    };

    const adjustment = calculateAdjustment();
    const total = baseTotal + adjustment;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error("Por favor, digite um cupom");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.trim().toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                toast.error("Cupom inválido ou expirado");
                return;
            }

            if (subtotal < data.min_value) {
                toast.error(`Este cupom exige um pedido mínimo de R$ ${data.min_value.toFixed(2)}`);
                return;
            }

            setAppliedCoupon(data);
            setShowCouponInput(false);
            toast.success("Cupom aplicado com sucesso!");
        } catch (err) {
            toast.error("Erro ao validar cupom");
        }
    };

    const handleFinalizeOrder = async () => {
        // Save to orders table first
        if (customerData?.id) {
            const { error } = await supabase.from('orders').insert({
                user_id: customerData.id,
                total_price: total,
                cart_items: cart,
                scheduling_data: schedulingData,
                customer_data: {
                    ...customerData,
                    applied_coupon: appliedCoupon?.code || null,
                    coupon_discount: adjustment || 0
                },
                status: 'pendente'
            });

            if (error) {
                console.error("Error saving order:", error);
                toast.error(`Erro ao processar o agendamento: ${error.message || "Tente novamente."}`);
                return;
            }
        }

        // --- SOLUÇÃO GARANTIDA: ABERTURA DO WHATSAPP COM DADOS ---
        const phoneNumber = "5511944816323";

        let text = `*NOVO PEDIDO DE SERVIÇO* ✨\n\n`;
        text += `*Cliente:* ${customerData?.name || "Não informado"}\n`;
        text += `*Telefone:* ${customerData?.phone || "Não informado"}\n`;
        text += `*Endereço:* ${customerData?.address || ""}, ${customerData?.number || ""} - ${customerData?.neighborhood || ""}\n\n`;

        text += `📅 *Agendamento:*\n`;
        text += `Data: ${schedulingData?.date || "Não informada"}\n`;
        text += `Período: ${schedulingData?.timeSlot || "Não informado"}\n`;
        text += `Voltagem: ${schedulingData?.voltage || "Não informada"}\n\n`;

        text += `🛍️ *Itens do Pedido:*\n`;
        cart.forEach((item) => {
            text += `• ${item.quantity}x ${item.service.name}\n`;
        });

        text += `\n*TOTAL: R$ ${total.toFixed(2)}*`;

        const encodedMsg = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

        // Abre o WhatsApp para o cliente enviar a mensagem final
        window.open(whatsappUrl, "_blank");

        setShowSuccessModal(true);
    };

    const handleFinalClose = () => {
        onFinish();
    };

    if (showSuccessModal) {
        return (
            <div className="w-full max-w-[480px] mx-auto flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                </div>

                <div className="space-y-4 mb-10">
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Pedido Confirmado!
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed text-lg">
                        Seu pedido foi recebido com sucesso. Em alguns instantes, nossa equipe entrará em contato para confirmar os detalhes.
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <Button
                        onClick={handleFinalClose}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-2xl text-xl uppercase tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        Encerrar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[480px] mx-auto pt-6 pb-[68px] min-h-full">
            <div className="space-y-6">
                {/* Header with Back Arrow */}
                <div className="px-4 sm:px-6 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 hover:bg-secondary rounded-full transition-colors group">
                        <ArrowLeft className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Revisão</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-4 sm:px-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Conferir dados e pedido
                    </h2>

                    {/* Customer Data Confirmation Card */}
                    <div className="rounded-xl border border-border bg-slate-50/50 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente</p>
                                <p className="text-sm font-semibold text-foreground">{customerData?.name || "Não informado"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Telefone</p>
                                <p className="text-sm font-semibold text-foreground">{customerData?.phone || "Não informado"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Endereço do Serviço</p>
                                <p className="text-sm font-semibold text-foreground leading-relaxed">
                                    {customerData?.address}, {customerData?.number}
                                    {customerData?.complement && ` - ${customerData.complement}`}
                                    <br />
                                    {customerData?.neighborhood}, {customerData?.city}/{customerData?.state}
                                    <br />
                                    CEP: {customerData?.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                            <ShoppingCart className="w-4 h-4 text-primary" /> Itens selecionados
                        </h3>

                        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                            <div className="divide-y divide-border">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="p-4 flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-foreground pr-4">{item.quantity}x {item.service.name}</span>
                                            <span className="font-bold whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        {item.details && (
                                            <p className="text-sm text-muted-foreground break-words">{item.details}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal dos itens</span>
                                    <span>R$ {subtotal.toFixed(2)}</span>
                                </div>

                                {isMinApplied && (
                                    <div className="flex justify-between text-sm text-amber-600 bg-amber-500/10 p-2 rounded-md">
                                        <span>Valor mínimo de pedido R$ 150,00</span>
                                        <span>+ R$ {(minOrderValue - subtotal).toFixed(2)}</span>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className={`flex justify-between text-sm p-2 rounded-md ${adjustment < 0 ? 'text-green-600 bg-green-500/10' : 'text-blue-600 bg-blue-500/10'}`}>
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-3 h-3" />
                                            <span>Cupom: <strong>{appliedCoupon.code}</strong></span>
                                        </div>
                                        <span>{adjustment < 0 ? '-' : '+'} R$ {Math.abs(adjustment).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-border">
                                    <span>Total a pagar</span>
                                    <div className="text-right">
                                        <span>R$ {total.toFixed(2)}</span>
                                        <p className="text-[13px] font-semibold text-muted-foreground mt-0.5 whitespace-nowrap">ou 10x de R$ {(total / 10).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coupon & Action Button */}
                    <div className="px-4 sm:px-6 flex flex-col gap-3 pt-8">
                        {showCouponInput ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="DIGITE O CUPOM"
                                    className="flex-1 bg-white border border-primary/20 rounded-xl px-4 py-2 text-sm font-bold tracking-wider outline-none focus:border-primary transition-colors"
                                    autoFocus
                                />
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-white font-bold h-auto px-6 rounded-xl text-xs uppercase"
                                    onClick={handleApplyCoupon}
                                >
                                    Aplicar
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    onClick={() => {
                                        setShowCouponInput(false);
                                        setCouponCode("");
                                        setAppliedCoupon(null);
                                    }}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                    <Ticket className="w-4 h-4" />
                                    <span>CUPOM: {appliedCoupon.code}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode("");
                                    }}
                                    className="text-green-700 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="border-primary text-primary hover:bg-[#1e3a8a] hover:text-white hover:border-[#1e3a8a] font-bold py-4 px-8 rounded-xl text-lg uppercase transition-all duration-300 active:scale-95 w-full flex items-center justify-center gap-2"
                                onClick={() => setShowCouponInput(true)}
                            >
                                <Ticket className="w-5 h-5" /> CUPOM
                            </Button>
                        )}
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-12 rounded-xl text-lg uppercase transition-transform active:scale-95 w-full"
                            onClick={handleFinalizeOrder}
                        >
                            FINALIZAR PEDIDO
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutReviewModal;
