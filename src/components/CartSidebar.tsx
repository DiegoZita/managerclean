import { Minus, Plus, ShoppingCart, ArrowRight, X } from "lucide-react";
import { CartItem } from "@/data/services";
import { Button } from "@/components/ui/button";

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onCheckout?: () => void;
}

const CartSidebar = ({ items, onUpdateQuantity, onRemove, onCheckout }: CartSidebarProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const minOrderValue = 150;
  const total = subtotal < 149 && subtotal > 0 ? minOrderValue : subtotal;
  const isMinApplied = subtotal < 149 && subtotal > 0;

  return (
    <div className="flex h-[550px] min-h-[550px] w-full flex-col rounded-[24px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header - Reduced padding and size */}
      <div className="bg-white px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-sky-400" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Seu Carrinho</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1 leading-none">
              {totalItems} {totalItems === 1 ? "serviço selecionado" : "serviços selecionados"}
            </p>
          </div>
        </div>
      </div>

      {/* Items List - Fixed space to fit items, scrollable if more than 3 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 bg-slate-50/20">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-slate-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-medium">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={`${item.service.id}-${idx}`} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100/60 relative group">
                <button
                  onClick={() => onRemove(idx)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all duration-200"
                  aria-label="Remover item"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex-1 text-left pr-6">
                  <p className="font-bold text-slate-800 text-sm mb-0.5 leading-tight">{item.service.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-3">
                    {item.details}
                  </p>

                  <div className="flex items-end justify-between">
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100/80 px-0.5 h-6">
                      <button
                        onClick={() => onUpdateQuantity(idx, -1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-sky-400 transition-colors"
                      >
                        <Minus className="h-2 w-2" />
                      </button>
                      <span className="w-5 text-center text-[10px] font-black text-slate-700">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-sky-400 transition-colors"
                      >
                        <Plus className="h-2 w-2" />
                      </button>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Preço</p>
                      <p className="font-black text-sky-400 text-sm leading-none">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Summary - Always visible to maintain structure */}
      <div className="p-6 bg-white border-t border-slate-50">
        {items.length > 0 && (
          <div className="flex flex-col items-end mb-5 w-full gap-1 animate-in fade-in duration-300">
            <p className="text-2xl font-black text-sky-400 tracking-tighter leading-none">
              R$ {total.toFixed(2)}
            </p>
            <p className="text-[11px] font-bold text-slate-400 leading-none mr-0.5">
              ou 10x de R$ {(total / 10).toFixed(2)} sem juros
            </p>
          </div>
        )}

        {isMinApplied && items.length > 0 && (
          <div className="mb-3 text-center">
            <p className="text-[8px] text-amber-500 font-black uppercase tracking-wider">
              Valor mínimo de R$ 150,00 aplicado
            </p>
          </div>
        )}

        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-10 bg-sky-400 hover:bg-sky-500 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-sky-400/20 transition-all active:scale-[0.98] group"
        >
          Ver Disponibilidade
          <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default CartSidebar;
