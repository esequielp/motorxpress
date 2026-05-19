import React, { useEffect, useState, useRef } from 'react';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, Mail } from 'lucide-react';
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
    <section className="py-8 sm:py-12 px-0 sm:px-4 container mx-auto">
      <div className="flex justify-between items-end mb-6 sm:mb-8 px-4 sm:px-0">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bebas tracking-wide uppercase">{title}</h2>
          <div className="h-1 w-16 sm:w-20 bg-theme-primary mt-2"></div>
        </div>
        <Link to="/catalogo" className="text-gray-400 hover:text-theme-primary flex items-center gap-1 group text-sm sm:text-base font-medium">
          Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex overflow-x-auto pb-6 px-4 sm:px-0 gap-4 sm:gap-6 hide-scrollbar ${isDown ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'}`}
      >
        {filteredProducts.slice(0, limit).map((p: any) => (
          <div key={p.id} className="w-[75vw] max-w-[280px] sm:w-[300px] flex-shrink-0 snap-start snap-always">
            <ProductCard product={p} />
          </div>
        ))}
        {filteredProducts.length > limit && (
          <div className="w-[45vw] max-w-[200px] sm:w-[200px] flex-shrink-0 snap-start snap-always flex flex-col items-center justify-center bg-black/20 border border-white/5 rounded-xl group hover:bg-black/40 transition-colors mr-4 sm:mr-0">
            <Link to="/catalogo" className="flex flex-col items-center gap-2 text-gray-400 hover:text-theme-primary p-6 w-full h-full justify-center">
               <div className="w-12 h-12 rounded-full bg-theme-element flex items-center justify-center group-hover:scale-110 group-hover:bg-theme-primary group-hover:text-black transition-all">
                 <ArrowRight className="w-6 h-6" />
               </div>
               <span className="font-bebas tracking-wider mt-2">Ver Más</span>
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
    <div className="flex flex-col min-h-screen bg-theme-base text-white selection:bg-theme-primary selection:text-white">
      {/* Hero */}
      <section className="relative w-full flex flex-col justify-start sm:justify-center pt-16 sm:pt-32 pb-12 sm:pb-20 min-h-[60vh] sm:min-h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=80" 
          alt="MotorXpress Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="container mx-auto px-4 relative z-20 text-[#ffffff]">
          <div className="max-w-2xl">
            <h1 className="text-[16vw] sm:text-6xl md:text-8xl font-bebas tracking-wide mb-2 sm:mb-4 leading-none" style={{ color: '#ffffff' }}>
              POTENCIA TU<br />
              <span className="text-theme-primary">MÁQUINA</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 font-light max-w-lg" style={{ color: '#e5e5e5' }}>
              Cotiza y compra repuestos premium para tu vehículo. Envío express a todo Chile.
            </p>

            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
              <h3 className="text-neutral-50 font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base hidden sm:flex">
                <span className="text-theme-primary">🚘</span> Encuentra repuestos para tu vehículo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                <select 
                  value={vehicleMake} 
                  onChange={e => { setVehicleMake(e.target.value); setVehicleModel(''); }}
                  className="bg-black/50 border border-white/20 text-neutral-50 text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary"
                >
                  <option value="">Marca...</option>
                  {mockMakes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={vehicleModel} 
                  onChange={e => setVehicleModel(e.target.value)}
                  disabled={!vehicleMake || !mockModels[vehicleMake]}
                  className="bg-black/50 border border-white/20 text-neutral-50 text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary disabled:opacity-50"
                >
                  <option value="">Modelo...</option>
                  {vehicleMake && mockModels[vehicleMake]?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={vehicleYear} 
                  onChange={e => setVehicleYear(e.target.value)}
                  className="bg-black/50 border border-white/20 text-neutral-50 text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary"
                >
                  <option value="">Año...</option>
                  {mockYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button 
                  onClick={handleVehicleSearch}
                  className="bg-theme-primary hover:bg-theme-primary-hover text-neutral-50 font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="flex gap-4">
               <Link to="/catalogo" className="bg-theme-card/80 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg w-full sm:w-fit inline-flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-lg">
                 Explorar Catálogo <ArrowRight className="w-5 h-5" />
               </Link>
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
        <div className="py-12">
          <RenderProductSection title="Destacados" filteredProducts={displayFeatured} />
          <RenderProductSection title="En Oferta" filteredProducts={offers} />
          <RenderProductSection title="Recién Llegados" filteredProducts={newArrivals} />
        </div>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-theme-base border-t border-theme-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center border border-theme-border p-10 rounded-2xl bg-theme-card relative overflow-hidden shadow-sm">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-primary to-transparent opacity-50"></div>
             <Mail className="w-12 h-12 mx-auto text-theme-primary mb-6" />
             <h2 className="text-4xl font-bebas mb-4 text-theme-primary">ÚNETE A LA REVOLUCIÓN MOTORXPRESS</h2>
             <p className="text-gray-500 mb-8 max-w-lg mx-auto">Suscríbete para recibir ofertas exclusivas, novedades de repuestos y tips de expertos directamente en tu correo.</p>
             
             <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
               <input 
                 type="email" 
                 required
                 value={newsletterEmail}
                 onChange={(e) => setNewsletterEmail(e.target.value)}
                 placeholder="Tu correo electrónico"
                 className="flex-1 bg-theme-base border border-theme-border focus:border-theme-primary px-4 py-3 rounded outline-none"
               />
               <button 
                 type="submit"
                 className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold px-6 py-3 rounded transition-colors"
               >
                 Suscribirme
               </button>
             </form>
             {newsletterStatus && (
               <p className="mt-4 text-sm font-medium text-green-600">{newsletterStatus}</p>
             )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-theme-card py-12 border-b border-theme-border">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-theme-border text-center">
          <div className="px-4">
            <h4 className="font-bebas text-2xl text-white mb-2">ENVÍOS EXPRESS</h4>
            <p className="text-gray-500 text-sm">A todo Chile vía Chilexpress</p>
          </div>
          <div className="px-4 border-t pt-8 sm:border-t-0 sm:pt-0">
            <h4 className="font-bebas text-2xl text-white mb-2">PAGO SEGURO</h4>
            <p className="text-gray-500 text-sm">Tarjetas y debito vía Flow</p>
          </div>
          <div className="px-4 border-t pt-8 md:border-t-0 md:pt-0">
            <h4 className="font-bebas text-2xl text-white mb-2">SOPORTE EXPERTO</h4>
            <p className="text-gray-500 text-sm">Asesoría mecánica en línea</p>
          </div>
          <div className="px-4 border-t pt-8 sm:border-t-0 md:pt-0">
            <h4 className="font-bebas text-2xl text-white mb-2">DEVOLUCIONES</h4>
            <p className="text-gray-500 text-sm">Garantía de 30 días</p>
          </div>
        </div>
      </section>
    </div>
  );
}

