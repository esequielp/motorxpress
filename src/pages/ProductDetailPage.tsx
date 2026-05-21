import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../store/cart';
import { formatCLP } from '../lib/utils/formatCLP';
import { getProductImages, getProductThumbnail } from '../lib/utils/image';
import { ShoppingCart, ShieldCheck, Zap, Truck, CheckCircle2, X, ChevronLeft, ChevronRight, Maximize2, Package } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

  const images = React.useMemo(() => {
    if (!product) return ['https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=800&q=80'];
    let baseImgs = getProductImages(product.image);
    if (product.type === 'variable' && product.variations) {
      const varImgs = product.variations.map((v:any) => v.image).filter(Boolean);
      for (const img of varImgs) {
        if (!baseImgs.includes(img)) baseImgs.push(img);
      }
    }
    return baseImgs.length > 0 ? baseImgs : ['https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=800&q=80'];
  }, [product]);

  const handleVariationSelect = (vId: string) => {
    setSelectedVariationId(vId);
    if (product && product.variations) {
      const v = product.variations.find((va: any) => va.id === vId);
      if (v && v.image) {
        const idx = images.indexOf(v.image);
        if (idx !== -1) setActiveImage(idx);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        
        const data = await res.json();
        if (!isMounted) return;
        
        setProduct(data);
        setActiveImage(0);
        
        if (data.type === 'variable' && data.variations && data.variations.length > 0) {
           setSelectedVariationId(data.variations[0].id);
        }

        // Fetch related separately
        try {
          const relRes = await fetch('/api/products');
          if (relRes.ok) {
             const allProducts = await relRes.json();
             if (Array.isArray(allProducts) && isMounted) {
                let manualCrossSells: any[] = [];
                if (data.cross_sell_ids) {
                  const terms = data.cross_sell_ids.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
                  manualCrossSells = allProducts.filter(p => (terms.includes(p.sku?.toLowerCase()) || terms.includes(p.mpn?.toLowerCase())) && p.id !== data.id);
                }
                
                let automaticRelated = allProducts.filter(p => p.category_id === data.category_id && p.id !== data.id && !manualCrossSells.find(m => m.id === p.id));
                let related = [...manualCrossSells, ...automaticRelated];
                
                if (related.length === 0) {
                   related = allProducts.filter(p => p.id !== data.id && !manualCrossSells.find(m => m.id === p.id));
                   related = [...manualCrossSells, ...related];
                }
                setRelatedProducts(related.slice(0, 4));
             }
          }
        } catch (e) {
          console.error("Failed fetching related products", e);
        }
        
      } catch (err) {
        console.error("Failed fetching product", err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowRight') nextImage(e as any);
      if (e.key === 'ArrowLeft') prevImage(e as any);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, images.length]);

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImage((p) => (p + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImage((p) => (p - 1 + images.length) % images.length);
  };

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!product) {
      console.error('Product is not loaded');
      return;
    }

    let itemToAdd = { ...product };
    
    if (product.type === 'variable' && selectedVariationId) {
       const variation = product.variations.find((v: any) => v.id === selectedVariationId);
       if (variation) {
         itemToAdd = {
           ...product,
           id: `${product.id}-${variation.id}`,
           sku: variation.sku,
           name: `${product.name} (${variation.name})`,
           price: variation.price || product.price,
           stock: variation.stock,
           maxStock: variation.stock
         };
       }
    }

    console.log('Adding product to cart:', itemToAdd);
    addItem({ ...itemToAdd, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-white">Cargando producto...</div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] flex items-center justify-center text-white">Producto no encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl selection:bg-theme-primary">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 font-medium">
        <Link to="/" className="hover:text-white">Inicio</Link> &gt;{' '}
        <Link to="/catalogo" className="hover:text-white">Catálogo</Link> &gt;{' '}
        <span className="text-gray-300">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border border-theme-border bg-theme-base rounded-2xl p-6 lg:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Subtle effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-theme-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        {/* IMAGE SECTION */}
        <div className="flex flex-col gap-4">
          <div 
            className="group relative bg-theme-card rounded-xl p-8 flex items-center justify-center h-[400px] lg:h-[500px] border border-theme-border overflow-hidden cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.is_offer === 1 && <span className="bg-theme-primary text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase">¡Oferta Especial!</span>}
              {product.is_new === 1 && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase">Nuevo</span>}
            </div>
            
            <img src={images[activeImage]} alt={product.name} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-black/50 text-white p-3 rounded-full backdrop-blur-sm">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-theme-primary' : 'border-transparent hover:border-theme-border'}`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* SALES CONTENT SECTION */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4 mt-6 lg:mt-0">
            <p className="text-theme-primary font-mono text-sm tracking-widest">SKU: {product.type === 'variable' && selectedVariationId ? product.variations?.find((v:any) => v.id === selectedVariationId)?.sku : product.sku}</p>
            {product.mpn && <p className="text-gray-400 font-mono text-sm tracking-widest">| MPN: {product.mpn}</p>}
            {product.type === 'combo' && <span className="bg-purple-100 px-2 py-1 rounded text-purple-800 text-xs font-bold border border-purple-200">COMBO</span>}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bebas leading-none mb-6 text-white uppercase shadow-sm">
            {product.name}
          </h1>
          
          <div className="mb-6 flex items-baseline gap-4">
             {product.type === 'variable' ? (
                <span className="text-5xl font-bold tracking-tight text-white">
                   {formatCLP(product.variations?.find((v:any) => v.id === selectedVariationId)?.price || product.price)}
                </span>
             ) : product.is_offer === 1 && product.offer_price ? (
               <>
                 <span className="text-5xl font-bold tracking-tight text-white">{formatCLP(product.offer_price)}</span>
                 <span className="text-xl text-gray-500 line-through decoration-[var(--theme-primary)]">{formatCLP(product.price)}</span>
               </>
             ) : (
               <span className="text-5xl font-bold tracking-tight text-white">{formatCLP(product.price)}</span>
             )}
          </div>

          {/* Variations Selector */}
          {product.type === 'variable' && product.variations && (
             <div className="mb-8">
               <h3 className="text-sm uppercase font-bold text-gray-400 mb-3">Selecciona una opción:</h3>
               <div className="flex flex-wrap gap-3">
                 {product.variations.map((v: any) => (
                   <button
                     key={v.id}
                     onClick={() => handleVariationSelect(v.id)}
                     className={`px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all ${
                        selectedVariationId === v.id 
                        ? 'border-theme-primary bg-theme-primary/10 text-theme-primary shadow-sm' 
                        : 'border-theme-border text-gray-300 hover:border-gray-500 bg-theme-card'
                     }`}
                   >
                     {v.name}
                   </button>
                 ))}
               </div>
             </div>
          )}

          {/* Combo Items */}
          {product.type === 'combo' && product.combo_items && (() => {
             let totalValue = 0;
             product.combo_items.forEach((item: any) => {
                if (item.product) totalValue += item.product.price * item.quantity;
             });
             const comboPrice = product.offer_price || product.price;
             const savings = totalValue > comboPrice ? totalValue - comboPrice : 0;
             const savingsPercent = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

             return (
               <div className="mb-8 p-4 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                 <h3 className="text-sm uppercase font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Este bundle incluye:
                 </h3>
                 <div className="space-y-3 mb-4">
                   {product.combo_items.map((item: any, idx: number) => (
                     <div key={idx} className="flex items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-2 rounded border border-gray-200 dark:border-gray-700">
                       <div className="flex items-center gap-3 overflow-hidden">
                         {item.product?.image && (
                            <img src={getProductThumbnail(item.product.image)} alt={item.product?.name} className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-700" />
                         )}
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.product?.name || `Producto #${item.product_id}`}</p>
                           <p className="text-xs text-gray-500">Precio unitario: {item.product ? formatCLP(item.product.price) : '--'}</p>
                         </div>
                       </div>
                       <div className="flex flex-col items-end shrink-0">
                         <span className="text-sm font-bold bg-gray-100 dark:bg-[#0f172a] text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">x{item.quantity}</span>
                         <span className="text-sm font-bold text-purple-700 dark:text-theme-primary">{item.product ? formatCLP(item.product.price * item.quantity) : '--'}</span>
                       </div>
                     </div>
                   ))}
                 </div>
                 {savings > 0 && (
                   <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded text-sm border border-green-200 dark:border-green-500/20">
                     <span className="font-bold">Valor real: <span className="line-through opacity-70">{formatCLP(totalValue)}</span></span>
                     <div className="flex items-center gap-1 font-bold">
                       Ahorras: {formatCLP(savings)} ({savingsPercent}%)
                     </div>
                   </div>
                 )}
               </div>
             );
          })()}

          {/* Hook & Story / Sales Pitch */}
          <div className="text-gray-300 text-lg leading-relaxed mb-6 space-y-4">
            <p>
              ¿Tu <strong className="text-white">{product.vehicle.split(' ')[0] || 'vehículo'}</strong> está pidiendo a gritos un cambio? No te arriesgues con repuestos alternativos de dudosa procedencia.
            </p>
            <p className="bg-theme-card border-l-4 border-theme-primary p-4 text-sm font-medium italic text-gray-400">
              "El costo de una falla en ruta es 10 veces mayor que el precio de un buen repuesto hoy mismo."
            </p>
          </div>

          {/* Technical Description */}
          {product.description && (
            <div className="mb-8 p-4 border border-theme-border rounded-lg">
              <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Especificaciones Técnicas</h3>
              <p className="text-gray-300 text-sm">{product.description}</p>
            </div>
          )}
          
          <div className="space-y-3 mb-8 bg-theme-card border border-theme-border p-6 rounded-xl">
            <h3 className="text-white font-bebas text-xl mb-4 tracking-wide">¿POR QUÉ LLEVARLO HOY?</h3>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Garantía de Compatibilidad Total para <strong className="text-white">{product.vehicle}</strong>.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Despacho el mismo día si compras antes de las 14:00 hrs.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Stock Crítico: <strong className="text-theme-primary">Sólo {product.type === 'variable' ? product.variations?.find((v:any) => v.id === selectedVariationId)?.stock : product.stock} unidades disponibles</strong> a este precio.</span>
            </div>
          </div>

          {(() => {
             const displayStock = product.type === 'variable' 
               ? product.variations?.find((v:any) => v.id === selectedVariationId)?.stock 
               : product.stock;
             
             return (
               <button 
                 onClick={handleAdd}
                 disabled={displayStock === 0}
                 className={`w-full py-4 rounded-lg flex items-center justify-center gap-3 text-lg font-bebas tracking-wide uppercase transition-all transform ${added ? 'bg-green-600 text-white cursor-default' : displayStock === 0 ? 'bg-theme-card border border-theme-border text-gray-500 cursor-not-allowed' : 'bg-theme-primary text-black hover:bg-theme-primary-hover active:scale-95 shadow-lg'}`}
               >
                 <ShoppingCart className="w-5 h-5 shrink-0" />
                 <span className="leading-none pt-1">
                   {added ? '¡AÑADIDO AL CARRITO!' : displayStock === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                 </span>
               </button>
             );
          })()}

          {/* Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center divide-x divide-[#1e293b]">
             <div className="flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Compra Segura</span>
             </div>
             <div className="flex flex-col items-center">
                <Truck className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Envío Express</span>
             </div>
             <div className="flex flex-col items-center">
                <Zap className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Calidad 100%</span>
             </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-3xl font-bebas text-white mb-6 border-b border-theme-border pb-4 uppercase">Productos Compatibles Recomendados</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 gap-4 sm:gap-6 hide-scrollbar md:grid md:grid-cols-4 md:overflow-visible md:snap-none">
            {relatedProducts.map(p => (
              <div key={p.id} className="w-[75vw] max-w-[280px] sm:w-[300px] md:w-auto flex-shrink-0 snap-start snap-always">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Controls */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/20 p-3 rounded-full transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/20 p-3 rounded-full transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Main Image */}
          <div 
            className="w-full max-w-5xl h-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          >
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain pointer-events-none" 
            />
          </div>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                className={`w-3 h-3 rounded-full transition-all ${activeImage === idx ? 'bg-theme-primary scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
