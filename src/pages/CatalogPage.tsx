import { useEffect, useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { Filter, X } from 'lucide-react';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  const [category, setCategory] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/brands').then(res => res.json())
    ]).then(([productsData, categoriesData, brandsData]) => {
      setProducts(productsData);
      setFilteredProducts(productsData);
      setDbCategories(categoriesData);
      setDbBrands(brandsData);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category) {
      result = result.filter(p => p.category_id === Number(category));
    }

    if (brand) {
      result = result.filter(p => p.brand_id === Number(brand));
    }

    setFilteredProducts(result);
  }, [category, brand, products]);

  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-[#1F1F24] pb-4">
        <div>
          <h1 className="text-3xl font-bebas">CATÁLOGO</h1>
          <p className="text-gray-400 text-sm font-mono mt-1">{filteredProducts.length} productos encontrados</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center gap-2 bg-[#1F1F24] text-white px-4 py-2 rounded font-bold"
        >
          <Filter size={18} /> Filtros
        </button>

        <div className={`sm:flex flex-col sm:flex-row gap-3 w-full sm:w-auto ${showFilters ? 'flex' : 'hidden'}`}>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="bg-[#18181C] border border-[#1F1F24] text-white text-sm rounded-lg block p-2.5 outline-none focus:border-[#E31C25] min-w-[200px] shadow-sm appearance-none"
          >
            <option value="">Todas las Categorías</option>
            {dbCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)}
            className="bg-[#18181C] border border-[#1F1F24] text-white text-sm rounded-lg block p-2.5 outline-none focus:border-[#E31C25] min-w-[200px] shadow-sm appearance-none"
          >
            <option value="">Todas las Marcas</option>
            {dbBrands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {(category || brand) && (
            <button 
              onClick={() => { setCategory(''); setBrand(''); }}
              className="text-gray-400 hover:text-white p-2 rounded flex items-center justify-center bg-[#1F1F24] sm:bg-transparent"
              title="Limpiar filtros"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <main className="flex-1 w-full">
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
