import React, { useState } from 'react';
import { ShoppingCart, Check, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart, CartItem } from '../../store/cart';
import { formatCLP } from '../../lib/utils/formatCLP';
import { cn } from '../../lib/utils/cn';

import { getProductThumbnail } from '../../lib/utils/image';

interface ProductCardProps {
  product: Omit<CartItem, 'quantity'> & { vehicle: string };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/producto/${product.id}`} className="flex flex-col h-full bg-theme-card border border-theme-border rounded-lg overflow-hidden group hover:border-theme-border-hover transition-all duration-300 hover:shadow-lg select-none">
      <div className="aspect-square bg-transparent w-full flex items-center justify-center p-6 relative">
        <img 
          src={getProductThumbnail(product.image)} 
          alt={product.name}
          draggable="false"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
           <span className="bg-[#e6fcf5] px-2 py-1 rounded text-[#0ca678] border border-[#0ca678]/20">✓ En stock</span>
           {(product as any).is_offer === 1 && <span className="bg-[#ffe600] px-2 py-1 rounded text-[#333333] shadow border border-[#fce100]">OFERTA</span>}
           {(product as any).is_new === 1 && <span className="bg-[#e7f5ff] px-2 py-1 rounded text-[#1971c2] shadow border border-[#1971c2]/20">NUEVO</span>}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1 font-mono tracking-tight">{product.sku}</p>
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-theme-primary transition-colors min-h-[40px]">{product.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-1 mb-4">{product.vehicle}</p>
        
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {(product as any).is_offer === 1 && (product as any).offer_price ? (
               <>
                 <span className="text-gray-500/70 text-sm line-through mb-0.5">{formatCLP(product.price)}</span>
                 <span className="text-theme-primary font-black text-xl sm:text-2xl leading-none tracking-tight">{formatCLP((product as any).offer_price)}</span>
               </>
            ) : (
               <span className="text-theme-primary font-bold text-xl sm:text-2xl leading-none">{formatCLP(product.price)}</span>
            )}
          </div>
          <button 
            onClick={handleAdd}
            className={cn(
              "w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 flex items-center justify-center relative z-10 shrink-0",
              added ? "bg-green-500 text-white shadow-md" : "bg-theme-primary text-theme-base hover:bg-theme-primary-hover hover:scale-105 shadow-sm",
              isPopping && "scale-125 shadow-xl ring-4 ring-theme-primary/40"
            )}
            aria-label="Añadir al carrito"
          >
            {added ? <Check className="w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in" /> : <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
