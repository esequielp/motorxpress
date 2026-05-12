import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../store/cart';
import { formatCLP } from '../../lib/utils/formatCLP';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';

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
          "fixed top-0 right-0 h-full w-full max-w-sm bg-[#18181C] border-l border-[#1F1F24] z-50 transform transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F24]">
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
                className="mt-4 text-[#E31C25] hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.sku} className="flex gap-4 p-3 bg-[#1F1F24] rounded-lg">
                <div className="w-20 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
                    <button onClick={() => removeItem(item.sku)} className="text-gray-500 hover:text-[#E31C25]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[#E31C25] font-bold mt-1">{formatCLP(item.price)}</p>
                  <div className="flex items-center mt-2 border border-gray-700 rounded w-fit">
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
          <div className="p-4 border-t border-[#1F1F24] bg-[#0A0A0C]">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="font-medium text-gray-300">Subtotal</span>
              <span className="text-xl font-bold">{formatCLP(total())}</span>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/checkout');
              }}
              className="w-full bg-[#E31C25] hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors"
            >
              PROCEDER AL PAGO
            </button>
          </div>
        )}
      </div>
    </>
  );
}
