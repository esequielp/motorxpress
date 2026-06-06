import React, { useState } from 'react';
import { ShoppingCart, Check, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product as any).type === 'variable') {
      window.location.href = `/producto/${product.id}`;
      return;
    }

    addItem(product);
    setAdded(true);
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300);
    setTimeout(() => setAdded(false), 2000);
  };

  const isVariable = (product as any).type === 'variable';

  const getCustomMetadata = () => {
    const nameLower = product.name.toLowerCase();
    const price = (product as any).is_offer === 1 && (product as any).offer_price ? (product as any).offer_price : product.price;
    
    if (nameLower.includes('aceite') || nameLower.includes('sintético') || nameLower.includes('5w-30')) {
      return {
        pill: <span className="bg-[#e6fcf5] text-[#0ca678] border border-[#0ca678]/15 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 self-start inline-block">Envío Gratis</span>,
        subtitle: `en 6x ${formatCLP(Math.round(price / 6))} sin interés`
      };
    }
    if (nameLower.includes('casco') || nameLower.includes('integral')) {
      return {
        pill: null,
        subtitle: "Envío nacional disponible"
      };
    }
    if (nameLower.includes('pastillas') || nameLower.includes('freno') || nameLower.includes('cerámicas')) {
      return {
        pill: <span className="bg-[#fff0f6] text-[#d6336c] border border-[#d6336c]/15 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 self-start inline-block">Más vendido</span>,
        subtitle: "Stock Limitado"
      };
    }
    if (nameLower.includes('filtro') || nameLower.includes('aire')) {
      return {
        pill: null,
        subtitle: "Mejora el rendimiento"
      };
    }
    if (product.is_new === 1 || nameLower.includes('led') || nameLower.includes('scanner') || nameLower.includes('rines') || nameLower.includes('batería')) {
      return {
        pill: <span className="text-theme-text-header text-[10px] font-bold uppercase tracking-wider mb-1 self-start inline-block">Nuevo</span>,
        subtitle: "Garantía de fabricante"
      };
    }
    return {
      pill: null,
      subtitle: "Compatibilidad garantizada"
    };
  };

  const metadata = getCustomMetadata();

  return (
    <Link to={`/producto/${product.id}`} className="flex flex-col h-full bg-theme-card border border-theme-border rounded-lg overflow-hidden group hover:border-theme-border-hover transition-all duration-300 hover:shadow-lg select-none">
      <div className="aspect-square bg-theme-element/30 w-full flex items-center justify-center p-3 relative border-b border-theme-border/50">
        <img 
          src={getProductThumbnail(product.image)} 
          alt={product.name}
          draggable="false"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
           <span className="bg-theme-card/90 px-1.5 py-0.5 rounded-sm text-theme-text-body border border-theme-border shadow-sm">✓ En stock</span>
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {metadata.pill}
        <h3 className="text-sm font-normal text-theme-text-body line-clamp-2 mb-1 group-hover:text-theme-text-header transition-colors min-h-[40px] leading-snug">{product.name}</h3>
        
        <div className="mt-2 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex flex-col">
            {(product as any).is_offer === 1 && (product as any).offer_price ? (
               <>
                 <span className="text-theme-text-body/70 text-[10px] sm:text-xs line-through block leading-none mb-1">{formatCLP(product.price)}</span>
                 <span className="text-theme-text-header font-medium text-lg sm:text-xl leading-none tracking-tight block">{formatCLP((product as any).offer_price)}</span>
               </>
            ) : (
               <span className="text-theme-text-header font-medium text-lg sm:text-xl leading-none tracking-tight block">{formatCLP(product.price)}</span>
            )}
            {isVariable && <span className="text-theme-text-body/70 text-[9px]">(Desde)</span>}
          </div>
          
          <div className="relative shrink-0">
             <motion.button 
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={handleAction}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center relative z-10 transition-colors",
                added ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
              )}
              aria-label={isVariable ? "Ver opciones" : "Añadir al carrito"}
             >
               <AnimatePresence mode="wait">
                 {added ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-4 h-4 text-green-700" />
                    </motion.div>
                 ) : (
                    <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      {isVariable ? <span className="text-sm font-bold">+</span> : <ShoppingCart className="w-4 h-4 text-inherit" fill="currentColor" />}
                    </motion.div>
                 )}
               </AnimatePresence>
             </motion.button>
          </div>
        </div>
        <p className="text-[10px] sm:text-[11px] text-theme-text-body/60 mt-1.5 sm:mt-2 line-clamp-1 font-light tracking-wide">{metadata.subtitle}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
