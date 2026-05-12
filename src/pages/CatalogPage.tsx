import { useEffect, useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { useLocation } from 'react-router-dom';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [category, setCategory] = useState<string>('');
  const [brand, setBrand] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category) {
      result = result.filter(p => p.name.toLowerCase().includes(category.toLowerCase()));
    }

    if (brand) {
      result = result.filter(p => p.vehicle.toLowerCase().includes(brand.toLowerCase()));
    }

    setFilteredProducts(result);
  }, [category, brand, products]);

  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bebas">TODOS LOS PRODUCTOS</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="bg-[#18181C] border border-[#1F1F24] text-white text-sm rounded-lg block p-2.5 outline-none focus:border-[#E31C25] min-w-[180px] shadow-sm"
          >
            <option value="">Todas las Categorías</option>
            {['Filtros', 'Frenos', 'Motor', 'Asientos', 'Iluminación', 'Baterías', 'Suspensión', 'Transmisión', 'Aceite', 'Bujía'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)}
            className="bg-[#18181C] border border-[#1F1F24] text-white text-sm rounded-lg block p-2.5 outline-none focus:border-[#E31C25] min-w-[180px] shadow-sm"
          >
            <option value="">Todas las Marcas</option>
            {['Toyota', 'Nissan', 'Universal'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="mb-4">
            <span className="text-gray-400 text-sm font-mono bg-[#1F1F24] px-3 py-1 rounded-full">{filteredProducts.length} resultados</span>
          </div>

          {filteredProducts.length === 0 ? (
             <div className="bg-[#18181C] border border-[#1F1F24] p-12 text-center rounded-lg flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-[#1F1F24] rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
               <p className="text-gray-400">Intenta modificando los filtros para ver más resultados.</p>
               <button 
                 onClick={() => { setCategory(''); setBrand(''); }}
                 className="mt-6 border border-[#E31C25] text-[#E31C25] px-6 py-2 rounded font-bold hover:bg-[#E31C25] hover:text-white transition-colors"
               >
                 Limpiar Filtros
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filteredProducts.map((p: any) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
