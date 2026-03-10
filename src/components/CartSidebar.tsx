import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import { CartItem } from "@/data/services";

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
    <div className="flex h-fit flex-col rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground">Carrinho de Compras</h2>
        <p className="text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "itens"}</p>
      </div>

      <div className="flex-1 divide-y divide-border">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <ShoppingCart className="h-8 w-8" />
            <p className="text-sm">Carrinho vazio</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={`${item.service.id}-${idx}`} className="flex items-start gap-3 p-4">
              <ShoppingCart className="mt-1 h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{item.service.name}</p>
                    <p className="text-xs text-muted-foreground">{item.details}</p>
                  </div>
                  <button onClick={() => onRemove(idx)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(idx, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-border text-foreground hover:bg-secondary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-border text-foreground hover:bg-secondary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-bold text-primary">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-border p-4">

          {isMinApplied && (
            <div className="mb-3 rounded-md bg-amber-500/10 px-3 py-2 border border-amber-500/20">
              <p className="text-xs text-amber-700 font-medium">
                Valor mínimo de pedido R$ 150,00
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">10x de R$ {(total / 10).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onCheckout}
            className="mt-4 w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            VER DISPONIBILIDADE
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
