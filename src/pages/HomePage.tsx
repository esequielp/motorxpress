import React, { useEffect, useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
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

  const RenderProductSection = ({ title, filteredProducts, limit = 4 }: { title: string, filteredProducts: any[], limit?: number }) => {
    if (filteredProducts.length === 0) return null;
    return (
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-bebas tracking-wide uppercase">{title}</h2>
            <div className="h-1 w-20 bg-[#E31C25] mt-2"></div>
          </div>
          <Link to="/catalogo" className="text-gray-400 hover:text-white flex items-center gap-1 group">
            Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.slice(0, limit).map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  };

  const featured = products.filter((p: any) => p.is_featured === 1);
  const offers = products.filter((p: any) => p.is_offer === 1);
  const newArrivals = products.filter((p: any) => p.is_new === 1);
  
  // Fallback if no tagged products exist yet
  const displayFeatured = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0C] text-white selection:bg-[#E31C25] selection:text-white">
      {/* Hero */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=80" 
          alt="MotorXpress Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-bebas tracking-wide mb-4 leading-none">
              POTENCIA TU<br />
              <span className="text-[#E31C25]">MÁQUINA</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 font-light max-w-lg">
              Cotiza y compra repuestos premium para tu vehículo. Envío express a todo Chile.
            </p>
            <div className="flex gap-4">
               <Link to="/catalogo" className="bg-[#E31C25] hover:bg-red-700 text-white font-bold py-4 px-8 rounded flex items-center gap-2 transition-transform hover:scale-105">
                 Ver Catálogo <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {products.length === 0 ? (
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#18181C] h-80 rounded-lg"></div>
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
      <section className="py-20 bg-gradient-to-t from-[#18181C] to-[#0A0A0C]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center border border-[#1F1F24] p-10 rounded-2xl bg-[#0A0A0C] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E31C25] to-transparent opacity-50"></div>
             <Mail className="w-12 h-12 mx-auto text-[#E31C25] mb-6" />
             <h2 className="text-4xl font-bebas mb-4">ÚNETE A LA REVOLUCIÓN MOTORXPRESS</h2>
             <p className="text-gray-400 mb-8 max-w-lg mx-auto">Suscríbete para recibir ofertas exclusivas, novedades de repuestos y tips de expertos directamente en tu correo.</p>
             
             <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
               <input 
                 type="email" 
                 required
                 value={newsletterEmail}
                 onChange={(e) => setNewsletterEmail(e.target.value)}
                 placeholder="Tu correo electrónico"
                 className="flex-1 bg-[#18181C] border border-[#1F1F24] text-white px-4 py-3 rounded outline-none focus:border-[#E31C25]"
               />
               <button 
                 type="submit"
                 className="bg-[#E31C25] hover:bg-red-600 text-white font-bold px-6 py-3 rounded transition-colors"
               >
                 Suscribirme
               </button>
             </form>
             {newsletterStatus && (
               <p className="mt-4 text-sm text-gray-300 font-medium">{newsletterStatus}</p>
             )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-[#18181C] py-12 border-y border-[#1F1F24]">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#1F1F24]">
          <div className="px-4">
            <h4 className="font-bebas text-2xl text-white mb-2">ENVÍOS EXPRESS</h4>
            <p className="text-gray-400 text-sm">A todo Chile vía Chilexpress</p>
          </div>
          <div className="px-4">
            <h4 className="font-bebas text-2xl text-white mb-2">PAGO SEGURO</h4>
            <p className="text-gray-400 text-sm">Tarjetas y debito vía Flow</p>
          </div>
          <div className="px-4">
            <h4 className="font-bebas text-2xl text-white mb-2">SOPORTE EXPERTO</h4>
            <p className="text-gray-400 text-sm">Asesoría mecánica en línea</p>
          </div>
          <div className="px-4">
            <h4 className="font-bebas text-2xl text-white mb-2">DEVOLUCIONES</h4>
            <p className="text-gray-400 text-sm">Garantía de 30 días</p>
          </div>
        </div>
      </section>
    </div>
  );
}

