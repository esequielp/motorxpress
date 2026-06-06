import React, { useEffect, useState, useRef } from 'react';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, Mail, Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockMakes = ['Toyota', 'Nissan', 'Universal'];
const mockModels: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Yaris', 'Hilux'],
  'Nissan': ['Versa', 'Sentra', 'Navara'],
  'Universal': ['Universal']
};
const mockYears = Array.from({length: 25}, (_, i) => String(new Date().getFullYear() - i));

const RenderProductSection = ({ title, filteredProducts, limit = 8 }: { title: string, filteredProducts: any[], limit?: number }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (filteredProducts.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="py-6 sm:py-10 px-4 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[22px] font-normal text-theme-text-header/80" style={{ fontFamily: 'Inter, sans-serif' }}>{title}</h2>
        <Link to="/catalogo" className="text-[13px] text-theme-text-header font-medium hover:text-red-600 transition-colors">
          Ver todo
        </Link>
      </div>
      <div 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex overflow-x-auto pb-4 gap-3 sm:gap-4 hide-scrollbar ${isDown ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'}`}
      >
        {filteredProducts.slice(0, limit).map((p: any) => (
          <div key={p.id} className="w-[45vw] max-w-[180px] sm:w-[200px] flex-shrink-0 snap-start snap-always">
            <ProductCard product={p} />
          </div>
        ))}
        {filteredProducts.length > limit && (
          <div className="w-[40vw] max-w-[140px] sm:w-[150px] flex-shrink-0 flex flex-col items-center justify-center bg-theme-element/50 border border-theme-border rounded-lg group hover:bg-theme-element transition-colors">
            <Link to="/catalogo" className="flex flex-col items-center gap-2 text-theme-text-body hover:text-theme-primary hover:brightness-90 p-6 w-full h-full justify-center">
               <div className="w-10 h-10 rounded-full bg-theme-card shadow-sm flex items-center justify-center group-hover:scale-105 transition-all">
                 <ArrowRight className="w-5 h-5" />
               </div>
               <span className="text-[13px] font-medium mt-2">Ver todo</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (vehicleMake) params.append('make', vehicleMake);
    if (vehicleModel) params.append('model', vehicleModel);
    if (vehicleYear) params.append('year', vehicleYear);
    navigate(`/catalogo?${params.toString()}`);
  }

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus(data.error);
      }
    } catch(err) {
      setNewsletterStatus('Ocurrió un error. Inténtalo nuevamente.');
    }
  };

  const featured = products.filter((p: any) => p.is_featured === 1);
  const offers = products.filter((p: any) => p.is_offer === 1);
  const newArrivals = products.filter((p: any) => p.is_new === 1);
  
  // Fallback if no tagged products exist yet
  const displayFeatured = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-theme-base text-theme-text-header selection:bg-theme-primary selection:text-white">
      {/* Hero */}
      <section className="relative w-full flex flex-col justify-start sm:justify-center pt-20 pb-16 min-h-[60vh] sm:min-h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=80" 
          alt="MotorXpress Hero" 
          className="absolute inset-0 w-full h-full object-cover scale-102 filter brightness-[0.85]"
        />
        
        <div className="container mx-auto px-4 relative z-20 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-3 leading-none text-theme-primary uppercase sm:mb-4">
              POTENCIA TU MÁQUINA
            </h1>
            <p className="text-sm sm:text-lg mb-8 font-medium max-w-xl text-white leading-relaxed">
              Encuentra los repuestos exactos que tu vehículo necesita con garantía certificada y entrega inmediata.
            </p>

            {/* Buscador de Compatibilidad white container with yellow header accent */}
            <div className="bg-theme-card p-6 rounded-xl mb-4 max-w-xl shadow-2xl text-theme-text-header border border-theme-border/40">
              <h3 className="text-theme-text-header font-bold mb-5 flex items-center gap-2 text-lg">
                Buscador de Compatibilidad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <select 
                    value={vehicleMake} 
                    onChange={e => { setVehicleMake(e.target.value); setVehicleModel(''); }}
                    className="bg-theme-element border border-theme-border text-theme-text-header text-sm rounded-md block w-full p-3 outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary "
                  >
                    <option value="">Marca</option>
                    {mockMakes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select 
                    value={vehicleModel} 
                    onChange={e => setVehicleModel(e.target.value)}
                    disabled={!vehicleMake || !mockModels[vehicleMake]}
                    className="bg-theme-element border border-theme-border text-theme-text-header text-sm rounded-md block w-full p-3 outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary  disabled:opacity-50"
                  >
                    <option value="">Modelo</option>
                    {vehicleMake && mockModels[vehicleMake]?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select 
                    value={vehicleYear} 
                    onChange={e => setVehicleYear(e.target.value)}
                    className="bg-theme-element border border-theme-border text-theme-text-header text-sm rounded-md block w-full p-3 outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary "
                  >
                    <option value="">Año</option>
                    {mockYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
              </div>
              <button 
                onClick={handleVehicleSearch}
                className="bg-black hover:bg-gray-900 text-white font-bold py-3.5 px-4 rounded-md w-full flex items-center justify-center shadow-md text-sm border-0 cursor-pointer transition-colors tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                BUSCAR REPUESTOS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Placed Right Under Hero image container as in Image 1 */}
      <section className="bg-theme-card py-6 border-b border-theme-border shadow-sm relative z-30">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 justify-start pl-2 sm:pl-4">
            <div className="bg-theme-primary/85 rounded-full p-2.5 text-theme-text-header flex items-center justify-center shrink-0 w-11 h-11 shadow-sm">
              <Truck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-theme-text-header uppercase tracking-wide leading-none">EXPRESS SHIPPING</h5>
              <p className="text-theme-text-body/70 text-[11px] mt-1 font-medium">Llega mañana</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-start pl-2 sm:pl-4">
            <div className="bg-theme-primary/85 rounded-full p-2.5 text-theme-text-header flex items-center justify-center shrink-0 w-11 h-11 shadow-sm">
              <ShieldCheck className="w-5 h-5 font-semibold" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-theme-text-header uppercase tracking-wide leading-none">SECURE PAYMENTS</h5>
              <p className="text-theme-text-body/70 text-[11px] mt-1 font-medium">100% Protegido</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-start pl-2 sm:pl-4">
            <div className="bg-theme-primary/85 rounded-full p-2.5 text-theme-text-header flex items-center justify-center shrink-0 w-11 h-11 shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-theme-text-header uppercase tracking-wide leading-none">EXPERT SUPPORT</h5>
              <p className="text-theme-text-body/70 text-[11px] mt-1 font-medium">Chat 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-start pl-2 sm:pl-4">
            <div className="bg-theme-primary/85 rounded-full p-2.5 text-theme-text-header flex items-center justify-center shrink-0 w-11 h-11 shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-theme-text-header uppercase tracking-wide leading-none">30-DAY RETURNS</h5>
              <p className="text-theme-text-body/70 text-[11px] mt-1 font-medium font-medium">Sin preguntas</p>
            </div>
          </div>
        </div>
      </section>

      {products.length === 0 ? (
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-theme-card h-80 rounded-lg"></div>
            ))}
          </div>
        </section>
      ) : (
        <div className="py-8 bg-theme-base">
          {/* Destacados Product grid */}
          <RenderProductSection title="Destacados" filteredProducts={displayFeatured} />

          {/* Cyber Motor Week promo banner between sections */}
          <section className="py-6 px-4 container mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white border border-gray-800 shadow-xl p-8 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-theme-primary/10 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex-1">
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase inline-block mb-3">
                  EN OFERTA
                </span>
                <h2 className="text-4xl sm:text-5xl font-bebas tracking-wide leading-tight mb-2">
                  Cyber Motor Week
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-xl font-light">
                  Aprovecha hasta un 40% de descuento en repuestos seleccionados para tu servicio o afinamiento.
                </p>
              </div>
              <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                <div className="flex flex-col text-center md:text-right shrink-0">
                  <span className="text-4xl sm:text-5xl font-black text-theme-primary tracking-tight leading-none mb-1">
                    40% OFF
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                    Por tiempo limitado
                  </span>
                </div>
                <Link 
                  to="/catalogo?offer=1" 
                  className="bg-theme-primary hover:brightness-95 text-theme-text-header font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider text-center w-full sm:w-auto hover:scale-103 transition-all duration-200 shadow-md flex items-center justify-center font-bold h-11 border-none cursor-pointer"
                >
                  VER PRODUCTOS
                </Link>
              </div>
            </div>
          </section>

          {/* New arrivals & Offers */}
          <RenderProductSection title="En Oferta" filteredProducts={offers} />
          <RenderProductSection title="Recién Llegados" filteredProducts={newArrivals} />
        </div>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-theme-primary border-t border-theme-primary text-theme-text-header">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
             <div className="flex-1 max-w-xl">
               <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                 ÚNETE A LA REVOLUCIÓN<br />MOTORXPRESS
               </h2>
               <p className="text-theme-text-header/80 text-sm sm:text-base font-normal">
                 Recibe ofertas exclusivas, consejos de mantenimiento y lanzamientos antes que nadie.
               </p>
             </div>
             
             <div className="flex-1 w-full max-w-md md:max-w-none flex flex-col items-start md:items-end">
               <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full max-w-lg gap-2 mb-3">
                 <input 
                   type="email" 
                   required
                   value={newsletterEmail}
                   onChange={(e) => setNewsletterEmail(e.target.value)}
                   placeholder="Tu correo electrónico"
                   className="flex-1 bg-theme-card border border-theme-border text-theme-text-body focus:border-theme-primary px-4 py-3 rounded-sm outline-none h-12 text-sm shadow-sm"
                 />
               </form>
               <p className="text-[9px] text-theme-text-header/60 uppercase tracking-widest text-left md:text-right w-full max-w-lg">
                 AL SUSCRIBIRTE, ACEPTAS NUESTRAS POLÍTICAS DE PRIVACIDAD Y TÉRMINOS DE SERVICIO.
               </p>
               {newsletterStatus && (
                 <p className="mt-2 text-sm font-bold text-accent text-left md:text-right w-full">{newsletterStatus}</p>
               )}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

