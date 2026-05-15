import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../store/cart';
import { formatCLP } from '../../lib/utils/formatCLP';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';
import { getProductThumbnail } from '../../lib/utils/image';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, total, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-theme-card border-l border-theme-border z-50 transform transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <h2 className="text-xl font-bold text-white font-bebas tracking-wide">TU CARRITO</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p>Tu carrito está vacío</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 text-theme-primary hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.sku} className="flex gap-4 p-3 bg-theme-element rounded-lg">
                <div className="w-20 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                  <img src={getProductThumbnail(item.image)} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
                    <button onClick={() => removeItem(item.sku)} className="text-gray-500 hover:text-theme-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-1 flex flex-col">
                    {item.is_offer === 1 && item.offer_price ? (
                      <>
                        <span className="text-theme-primary font-bold">{formatCLP(item.offer_price)}</span>
                        <span className="text-gray-500 text-xs line-through">{formatCLP(item.price)}</span>
                      </>
                    ) : (
                      <span className="text-theme-primary font-bold">{formatCLP(item.price)}</span>
                    )}
                  </div>
                  <div className="flex items-center mt-2 border border-theme-border-hover rounded w-fit">
                    <button 
                      onClick={() => updateQty(item.sku, item.quantity - 1)}
                      className="px-2 py-1 text-gray-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-sm text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.sku, item.quantity + 1)}
                      className="px-2 py-1 text-gray-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-theme-border bg-theme-base">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="font-medium text-gray-300">Subtotal</span>
              <span className="text-xl font-bold">{formatCLP(total())}</span>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/checkout');
              }}
              className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-3 rounded-md transition-colors"
            >
              PROCEDER AL PAGO
            </button>
          </div>
        )}
      </div>
    </>
  );
}
