import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .neq("status", "excluido")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
                toast.error("Erro ao carregar os pedidos: " + error.message);
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background">
            <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <Package className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">Meus Pedidos</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
                        <p className="text-muted-foreground">Você ainda não realizou nenhum agendamento de serviço.</p>
                        <button
                            onClick={() => navigate("/orcamento")}
                            className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Fazer novo pedido
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const date = new Date(order.created_at);
                            const scheduling = order.scheduling_data;
                            const statusColors: Record<string, string> = {
                                agendado: "bg-blue-100 text-blue-800 border-blue-200",
                                concluido: "bg-green-100 text-green-800 border-green-200",
                                cancelado: "bg-red-100 text-red-800 border-red-200"
                            };

                            const headerColors: Record<string, string> = {
                                agendado: "bg-blue-50 border-b-blue-100",
                                concluido: "bg-green-50 border-b-green-100",
                                cancelado: "bg-red-50 border-b-red-100"
                            };

                            return (
                                <div key={order.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                    <div className={`px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${headerColors[order.status] || "bg-muted/30 border-b-border"}`}>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Pedido realizado em</p>
                                            <p className="font-semibold text-foreground">
                                                {format(date, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                                                {order.status}
                                            </span>
                                            <span className="font-bold text-lg">R$ {parseFloat(order.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Itens do Pedido
                                            </h3>
                                            <div className="space-y-3">
                                                {Array.isArray(order.cart_items) ? order.cart_items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-start text-sm">
                                                        <div>
                                                            <span className="font-semibold">{item.quantity}x</span> {item.service?.name || "Serviço"}
                                                            {item.details && <p className="text-xs text-muted-foreground mt-1 ml-4">{item.details}</p>}
                                                        </div>
                                                        <span className="font-medium whitespace-nowrap ml-4">
                                                            R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-muted-foreground">Itens não encontrados</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" /> Agendamento
                                            </h3>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <p className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 shrink-0" /> {scheduling?.date}</p>
                                                <p className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {scheduling?.timeSlot}</p>
                                                <p className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <span>
                                                        {order.customer_data?.address}, {order.customer_data?.number}<br />
                                                        {order.customer_data?.neighborhood}, {order.customer_data?.city}/{order.customer_data?.state}
                                                    </span>
                                                </p>
                                                {scheduling?.observations && (
                                                    <p className="mt-2 text-xs italic bg-muted p-2 rounded-md">
                                                        " {scheduling.observations} "
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
