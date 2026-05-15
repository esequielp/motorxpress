import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../store/cart';
import { formatCLP } from '../lib/utils/formatCLP';
import { getProductImages, getProductThumbnail } from '../lib/utils/image';
import { ShoppingCart, ShieldCheck, Zap, Truck, CheckCircle2, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productImages = product ? getProductImages(product.image) : [];
  const images = productImages.length > 0 ? productImages : [
    'https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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

  const handleAdd = () => {
    if (!product) return;
    addItem({ ...product, quantity: 1 });
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
    <div className="container mx-auto px-4 py-12 max-w-6xl selection:bg-[#E31C25]">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 font-medium">
        <Link to="/" className="hover:text-white">Inicio</Link> &gt;{' '}
        <Link to="/catalogo" className="hover:text-white">Catálogo</Link> &gt;{' '}
        <span className="text-gray-300">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border border-[#1F1F24] bg-[#0A0A0C] rounded-2xl p-6 lg:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Subtle effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#E31C25] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        {/* IMAGE SECTION */}
        <div className="flex flex-col gap-4">
          <div 
            className="group relative bg-[#18181C] rounded-xl p-8 flex items-center justify-center h-[400px] lg:h-[500px] border border-[#1F1F24] overflow-hidden cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.is_offer === 1 && <span className="bg-[#E31C25] text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase">¡Oferta Especial!</span>}
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
                className={`flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-[#E31C25]' : 'border-transparent hover:border-[#1F1F24]'}`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* SALES CONTENT SECTION */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-[#E31C25] font-mono text-sm tracking-widest">SKU: {product.sku}</p>
            {product.mpn && <p className="text-gray-400 font-mono text-sm tracking-widest">| MPN: {product.mpn}</p>}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bebas leading-none mb-6 text-white uppercase shadow-sm">
            {product.name}
          </h1>
          
          <div className="mb-6 flex items-baseline gap-4">
             {product.is_offer === 1 && product.offer_price ? (
               <>
                 <span className="text-5xl font-bold tracking-tight text-white">{formatCLP(product.offer_price)}</span>
                 <span className="text-xl text-gray-500 line-through decoration-[#E31C25]">{formatCLP(product.price)}</span>
               </>
             ) : (
               <span className="text-5xl font-bold tracking-tight text-white">{formatCLP(product.price)}</span>
             )}
          </div>

          {/* Hook & Story / Sales Pitch */}
          <div className="text-gray-300 text-lg leading-relaxed mb-6 space-y-4">
            <p>
              ¿Tu <strong className="text-white">{product.vehicle.split(' ')[0] || 'vehículo'}</strong> está pidiendo a gritos un cambio? No te arriesgues con repuestos alternativos de dudosa procedencia.
            </p>
            <p className="bg-[#18181C] border-l-4 border-[#E31C25] p-4 text-sm font-medium italic text-gray-400">
              "El costo de una falla en ruta es 10 veces mayor que el precio de un buen repuesto hoy mismo."
            </p>
          </div>

          {/* Technical Description */}
          {product.description && (
            <div className="mb-8 p-4 border border-[#1F1F24] rounded-lg">
              <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Especificaciones Técnicas</h3>
              <p className="text-gray-300 text-sm">{product.description}</p>
            </div>
          )}
          
          <div className="space-y-3 mb-8 bg-[#18181C] border border-[#1F1F24] p-6 rounded-xl">
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
              <span>Stock Crítico: <strong className="text-[#E31C25]">Sólo {product.stock} unidades disponibles</strong> a este precio.</span>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full py-5 rounded-lg flex items-center justify-center gap-3 text-xl font-bold uppercase transition-all transform ${added ? 'bg-green-600 text-white cursor-default' : product.stock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#E31C25] hover:bg-red-700 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(227,28,37,0.3)]'}`}
          >
            <ShoppingCart className="w-6 h-6" />
            {added ? '¡AÑADIDO AL CARRITO!' : product.stock === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO AHORA'}
          </button>

          {/* Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center divide-x divide-[#1F1F24]">
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
                className={`w-3 h-3 rounded-full transition-all ${activeImage === idx ? 'bg-[#E31C25] scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
