import { useEffect, useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import { Filter, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  const [category, setCategory] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const [vehicleMake, setVehicleMake] = useState<string>(searchParams.get('make') || '');
  const [vehicleModel, setVehicleModel] = useState<string>(searchParams.get('model') || '');
  const [vehicleYear, setVehicleYear] = useState<string>(searchParams.get('year') || '');

  useEffect(() => {
    setIsClient(true);
    
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/brands').then(res => res.json())
    ]).then(([productsData, categoriesData, brandsData]) => {
      const p = Array.isArray(productsData) ? productsData : [];
      setProducts(p);
      setFilteredProducts(p);
      setDbCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setDbBrands(Array.isArray(brandsData) ? brandsData : []);
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

    if (vehicleMake) {
      result = result.filter(p => p.vehicle?.toLowerCase().includes(vehicleMake.toLowerCase()));
    }
    if (vehicleModel) {
      result = result.filter(p => p.vehicle?.toLowerCase().includes(vehicleModel.toLowerCase()));
    }
    if (vehicleYear) {
      result = result.filter(p => p.vehicle?.includes(vehicleYear) || p.vehicle?.includes('Universal'));
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const priceA = a.is_offer ? (a.offer_price || a.price) : a.price;
        const priceB = b.is_offer ? (b.offer_price || b.price) : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const priceA = a.is_offer ? (a.offer_price || a.price) : a.price;
        const priceB = b.is_offer ? (b.offer_price || b.price) : b.price;
        return priceB - priceA;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(result);
  }, [category, brand, vehicleMake, vehicleModel, vehicleYear, sortBy, products]);

  if (!isClient) return null;

  const mockMakes = ['Toyota', 'Nissan', 'Universal'];
  const mockModels: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Yaris', 'Hilux'],
    'Nissan': ['Versa', 'Sentra', 'Navara'],
    'Universal': ['Universal']
  };
  const mockYears = Array.from({length: 25}, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-theme-border pb-4">
        <div>
          <h1 className="text-3xl font-bebas">CATÁLOGO</h1>
          <p className="text-gray-400 text-sm font-mono mt-1">{filteredProducts.length} productos encontrados</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center gap-2 bg-theme-element text-white px-4 py-2 rounded font-bold"
        >
          <Filter size={18} /> Filtros
        </button>

        <div className={`sm:flex flex-col sm:flex-row gap-3 w-full sm:w-auto overflow-x-auto ${showFilters ? 'flex' : 'hidden'}`}>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-theme-card border border-theme-border text-white text-sm rounded-lg block p-2.5 outline-none focus:border-theme-primary min-w-[180px] shadow-sm appearance-none"
          >
            <option value="featured">Relevancia</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name-asc">Nombre: A - Z</option>
            <option value="name-desc">Nombre: Z - A</option>
          </select>

          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="bg-theme-card border border-theme-border text-white text-sm rounded-lg block p-2.5 outline-none focus:border-theme-primary min-w-[180px] shadow-sm appearance-none"
          >
            <option value="">Todas las Categorías</option>
            {dbCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)}
            className="bg-theme-card border border-theme-border text-white text-sm rounded-lg block p-2.5 outline-none focus:border-theme-primary min-w-[180px] shadow-sm appearance-none"
          >
            <option value="">Todas las Marcas</option>
            {dbBrands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {(category || brand || sortBy !== 'featured' || vehicleMake || vehicleModel || vehicleYear) && (
            <button 
              onClick={() => { setCategory(''); setBrand(''); setSortBy('featured'); setVehicleMake(''); setVehicleModel(''); setVehicleYear(''); }}
              className="text-gray-400 hover:text-white p-2 rounded flex items-center justify-center bg-theme-element sm:bg-transparent"
              title="Limpiar filtros"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Selector */}
      <div className="bg-theme-card border border-theme-border rounded-lg p-4 mb-6">
        <h2 className="text-white font-bold mb-3 flex items-center gap-2">
          <span className="text-theme-primary">🚘</span> Filtra por tu vehículo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select 
            value={vehicleMake} 
            onChange={e => { setVehicleMake(e.target.value); setVehicleModel(''); }}
            className="bg-theme-element border border-theme-border text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary"
          >
            <option value="">Marca...</option>
            {mockMakes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select 
            value={vehicleModel} 
            onChange={e => setVehicleModel(e.target.value)}
            disabled={!vehicleMake || !mockModels[vehicleMake]}
            className="bg-theme-element border border-theme-border text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary disabled:opacity-50"
          >
            <option value="">Modelo...</option>
            {vehicleMake && mockModels[vehicleMake]?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select 
            value={vehicleYear} 
            onChange={e => setVehicleYear(e.target.value)}
            className="bg-theme-element border border-theme-border text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-theme-primary"
          >
            <option value="">Año...</option>
            {mockYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <main className="flex-1 w-full">
          {filteredProducts.length === 0 ? (
             <div className="bg-theme-card border border-theme-border p-12 text-center rounded-lg flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-theme-element rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
               <p className="text-gray-400">Intenta modificando los filtros para ver más resultados.</p>
               <button 
                 onClick={() => { setCategory(''); setBrand(''); setSortBy('featured'); setVehicleMake(''); setVehicleModel(''); setVehicleYear(''); }}
                 className="mt-6 border border-theme-primary text-theme-primary px-6 py-2 rounded font-bold hover:bg-theme-primary hover:text-white transition-colors"
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
