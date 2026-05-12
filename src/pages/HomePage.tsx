import { useEffect, useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

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

      {/* Featured Products */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bebas tracking-wide">DESTACADOS</h2>
            <div className="h-1 w-20 bg-[#E31C25] mt-2"></div>
          </div>
          <Link to="/catalogo" className="text-gray-400 hover:text-white flex items-center gap-1 group">
            Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#18181C] h-80 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map((p: any) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}
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
