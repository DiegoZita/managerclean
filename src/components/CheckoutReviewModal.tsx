import { ArrowLeft, ShoppingCart, CheckCircle2, User, MapPin, Phone, Ticket, X } from "lucide-react";
import { useState } from "react";
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
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const minOrderValue = 150;
    const isMinApplied = subtotal < 149 && subtotal > 0;
    const total = isMinApplied ? minOrderValue : subtotal;

    const handleWhatsAppRedirect = () => {
        const phone = "5511944816323";

        // Format Items
        const itemsText = cart.map(item => {
            let text = `${item.quantity}x ${item.service.name} (R$ ${(item.price * item.quantity).toFixed(2)})`;
            if (item.details) {
                text += `\n   ${item.details}`;
            }
            return text;
        }).join("\n");

        // Format Customer & Address
        const customerName = customerData?.name || "Não informado";
        const customerPhone = customerData?.phone || "Não informado";
        const addressText = customerData ?
            `${customerData.address}, ${customerData.number}${customerData.complement ? ` - ${customerData.complement}` : ''} - ${customerData.neighborhood}, ${customerData.city}/${customerData.state} CEP: ${customerData.zipCode}`
            : "Não informado";

        // Format Scheduling
        const schedDate = schedulingData?.date || "Não informada";
        const schedTime = schedulingData?.timeSlot || "Não informado";
        const schedVolt = schedulingData?.voltage || "Não informada";
        const schedObs = schedulingData?.observations || "Sem observações";

        const text = `*NOVO PEDIDO DE SERVIÇO* ✨\n\n` +
            `*Cliente:* ${customerName}\n` +
            `*Telefone:* ${customerPhone}\n` +
            `*Endereço:* ${addressText}\n\n` +
            `*📅 Agendamento:*\n` +
            `*Data:* ${schedDate}\n` +
            `*Período:* ${schedTime}\n` +
            `*Voltagem:* ${schedVolt}\n` +
            `*Observações:* ${schedObs}\n\n` +
            `*🛍️ Itens do Pedido:*\n${itemsText}\n\n` +
            `*💵 Resumo:*\n` +
            `Subtotal: R$ ${subtotal.toFixed(2)}\n` +
            (isMinApplied ? `Complemento p/ pedido mínimo: R$ ${(minOrderValue - subtotal).toFixed(2)}\n` : '') +
            `*Total: R$ ${total.toFixed(2)}*`;

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;

        // Save to orders table
        if (customerData?.id) {
            supabase.from('orders').insert({
                user_id: customerData.id,
                total_price: total,
                cart_items: cart,
                scheduling_data: schedulingData,
                customer_data: customerData,
                status: 'agendado'
            }).then(({ error }) => {
                if (error) console.error("Error saving order:", error);
            });
        }

        window.open(whatsappUrl, '_blank');
        onFinish();
    };

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
                                    onClick={() => {
                                        if (couponCode.trim()) {
                                            toast.info(`Cupom "${couponCode}" aplicado! (Funcionalidade em desenvolvimento)`);
                                            setShowCouponInput(false);
                                        } else {
                                            toast.error("Por favor, digite um cupom");
                                        }
                                    }}
                                >
                                    Aplicar
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    onClick={() => {
                                        setShowCouponInput(false);
                                        setCouponCode("");
                                    }}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
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
                            onClick={handleWhatsAppRedirect}
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
