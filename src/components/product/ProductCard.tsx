import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <Link to={`/producto/${product.id}`} className="block bg-[#18181C] border border-[#1F1F24] rounded-lg overflow-hidden group hover:border-gray-700 transition-colors">
      <div className="aspect-square bg-[#0A0A0C] w-full flex items-center justify-center p-6 relative">
        <img 
          src={getProductThumbnail(product.image)} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs font-medium backdrop-blur-sm">
           <span className="bg-black/60 px-2 py-1 rounded text-green-400">✓ En stock</span>
           {(product as any).is_offer === 1 && <span className="bg-[#E31C25]/80 px-2 py-1 rounded text-white shadow">OFERTA</span>}
           {(product as any).is_new === 1 && <span className="bg-blue-600/80 px-2 py-1 rounded text-white shadow">NUEVO</span>}
        </div>
      </div>
      <div className="p-4 flex flex-col h-[180px]">
        <p className="text-xs text-gray-500 mb-1 font-mono">{product.sku}</p>
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-[#E31C25] transition-colors">{product.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-1 mb-auto">{product.vehicle}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            {(product as any).is_offer === 1 && (product as any).offer_price ? (
               <>
                 <span className="text-[#E31C25] font-bold text-lg">{formatCLP((product as any).offer_price)}</span>
                 <span className="text-gray-500 text-xs line-through">{formatCLP(product.price)}</span>
               </>
            ) : (
               <span className="text-[#E31C25] font-bold text-lg">{formatCLP(product.price)}</span>
            )}
          </div>
          <button 
            onClick={handleAdd}
            className={cn(
              "p-2 rounded-md transition-colors flex items-center justify-center relative z-10",
              added ? "bg-green-600 text-white" : "bg-[#1F1F24] text-white hover:bg-[#E31C25]"
            )}
            title="Agregar al carrito"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
