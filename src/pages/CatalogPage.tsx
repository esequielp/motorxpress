import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/product/ProductCard';
import { Filter, X, Search, RotateCcw, ChevronRight, Tag, Sparkles, Layers, SlidersHorizontal, DollarSign } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...
  const [products, setProducts] = useState<any[]>([]); // To hold all for counts, if needed, though we can skip
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  // Filtering states initialized from URL params if present
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [category, setCategory] = useState<string>(searchParams.get('cat') || '');
  const [brand, setBrand] = useState<string>(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [vehicleMake, setVehicleMake] = useState<string>(searchParams.get('make') || '');
  const [vehicleModel, setVehicleModel] = useState<string>(searchParams.get('model') || '');
  const [vehicleYear, setVehicleYear] = useState<string>(searchParams.get('year') || '');

  // Detailed filters
  const [priceMin, setPriceMin] = useState<string>(searchParams.get('pmin') || '');
  const [priceMax, setPriceMax] = useState<string>(searchParams.get('pmax') || '');
  const [filterOffer, setFilterOffer] = useState<boolean>(searchParams.get('offer') === 'true');
  const [filterNew, setFilterNew] = useState<boolean>(searchParams.get('new') === 'true');
  const [filterStock, setFilterStock] = useState<boolean>(searchParams.get('stock') === 'true');

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Initial load for Global Filter Metadata (all products for counts, categories, brands)
  useEffect(() => {
    setIsClient(true);
    
    Promise.all([
      fetch('/api/products').then(res => res.json()), // All products for counts baseline
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/brands').then(res => res.json())
    ]).then(([productsData, categoriesData, brandsData]) => {
      const p = Array.isArray(productsData) ? productsData : [];
      setProducts(p); // keeping this for getBrandCount / getCategoryCount
      setDbCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setDbBrands(Array.isArray(brandsData) ? brandsData : []);
    }).catch(console.error);
  }, []);

  // AJAX Fetching whenever filters change
  useEffect(() => {
    if (!isClient) return;

    // Sync state back to URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('cat', category);
    if (brand) params.set('brand', brand);
    if (vehicleMake) params.set('make', vehicleMake);
    if (vehicleModel) params.set('model', vehicleModel);
    if (vehicleYear) params.set('year', vehicleYear);
    if (priceMin) params.set('pmin', priceMin);
    if (priceMax) params.set('pmax', priceMax);
    if (filterOffer) params.set('offer', 'true');
    if (filterNew) params.set('new', 'true');
    if (filterStock) params.set('stock', 'true');
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });

    // Perform AJAX request to backend
    const fetchFiltered = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category) queryParams.set('category', category);
        if (brand) queryParams.set('brand', brand);
        if (searchQuery) queryParams.set('search', searchQuery);
        if (vehicleMake) queryParams.set('vehicle_make', vehicleMake);
        if (vehicleModel) queryParams.set('vehicle_model', vehicleModel);
        if (vehicleYear) queryParams.set('vehicle_year', vehicleYear);
        if (priceMin) queryParams.set('price_min', priceMin);
        if (priceMax) queryParams.set('price_max', priceMax);
        if (filterOffer) queryParams.set('is_offer', 'true');
        if (filterNew) queryParams.set('is_new', 'true');
        if (filterStock) queryParams.set('in_stock', 'true');
        if (sortBy) queryParams.set('sort', sortBy);

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch filtered products');
        const data = await res.json();
        setFilteredProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("AJAX Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiltered();
  }, [
    category, brand, vehicleMake, vehicleModel, vehicleYear, sortBy, 
    searchQuery, priceMin, priceMax, filterOffer, filterNew, filterStock, 
    isClient, setSearchParams
  ]);

  if (!isClient) return null;

  const mockMakes = ['Toyota', 'Nissan', 'Universal'];
  const mockModels: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Yaris', 'Hilux'],
    'Nissan': ['Versa', 'Sentra', 'Navara'],
    'Universal': ['Universal']
  };
  const mockYears = Array.from({length: 25}, (_, i) => String(new Date().getFullYear() - i));

  // Count items matching current base list (calculated before filters to ensure lists look right)
  const getCategoryCount = (id: number) => {
    return products.filter(p => p.category_id === id).length;
  };

  const getBrandCount = (id: number) => {
    return products.filter(p => p.brand_id === id).length;
  };

  const sortedCategories = [...dbCategories].sort((a, b) => getCategoryCount(b.id) - getCategoryCount(a.id));
  const visibleCategories = showAllCategories ? sortedCategories : sortedCategories.slice(0, 6);

  const sortedBrands = [...dbBrands].sort((a, b) => getBrandCount(b.id) - getBrandCount(a.id));
  const visibleBrands = showAllBrands ? sortedBrands : sortedBrands.slice(0, 6);

  const hasActiveFilters = 
    searchQuery || category || brand || vehicleMake || vehicleModel || vehicleYear || priceMin || priceMax || filterOffer || filterNew || filterStock;

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setBrand('');
    setSortBy('featured');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setPriceMin('');
    setPriceMax('');
    setFilterOffer(false);
    setFilterNew(false);
    setFilterStock(false);
  };

  const setPriceBracket = (min: string, max: string) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  // Shared Sidebar content (Visual representation of filters)
  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* 1. Header with Reset option */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-border/50">
        <h3 className="font-semibold text-[15px] text-white flex items-center gap-2">
          Filtros
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={handleClearFilters}
            className="text-xs text-theme-primary hover:text-white transition"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* 2. Compatibility Selector Card (Simplified to blend in) */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">
          Compatibilidad
        </h4>
        <div className="space-y-2.5">
          <div>
            <select 
              value={vehicleMake} 
              onChange={e => { setVehicleMake(e.target.value); setVehicleModel(''); }}
              className="bg-transparent border-b border-theme-border text-white text-[13px] block w-full py-1.5 outline-none focus:border-theme-primary transition"
            >
              <option value="" className="bg-theme-card text-gray-400">Marca</option>
              {mockMakes.map(m => <option key={m} value={m} className="bg-theme-card text-white">{m}</option>)}
            </select>
          </div>
          <div>
            <select 
              value={vehicleModel} 
              onChange={e => setVehicleModel(e.target.value)}
              disabled={!vehicleMake || !mockModels[vehicleMake]}
              className="bg-transparent border-b border-theme-border text-white text-[13px] block w-full py-1.5 outline-none focus:border-theme-primary disabled:opacity-40 transition"
            >
              <option value="" className="bg-theme-card text-gray-400">Modelo</option>
              {vehicleMake && mockModels[vehicleMake]?.map(m => <option key={m} value={m} className="bg-theme-card text-white">{m}</option>)}
            </select>
          </div>
          <div>
            <select 
              value={vehicleYear} 
              onChange={e => setVehicleYear(e.target.value)}
              className="bg-transparent border-b border-theme-border text-white text-[13px] block w-full py-1.5 outline-none focus:border-theme-primary transition"
            >
              <option value="" className="bg-theme-card text-gray-400">Año de Fabricación</option>
              {mockYears.map(y => <option key={y} value={y} className="bg-theme-card text-white">{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Word quick search */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">Búsqueda</h4>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por repuesto, SKU..." 
            className="w-full bg-transparent border border-theme-border/70 text-white text-[13px] rounded pl-8 pr-3 py-1.5 outline-none focus:border-theme-primary transition"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2.5 top-[8px] text-gray-500" size={13} />
        </div>
      </div>

      {/* 4. Display Categories */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">Categorías</h4>
        <div className="space-y-1.5 pr-1">
          <button
            onClick={() => setCategory('')}
            className={`w-full text-left text-[13px] py-1 flex items-center justify-between transition ${!category ? 'text-theme-primary font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <span>Todas</span>
            <span className="text-[10px] font-mono text-gray-500 border border-theme-border/50 px-1.5 py-0.5 rounded-full min-w-[24px] text-center">
              {products.length}
            </span>
          </button>
          {visibleCategories.map(cat => {
            const count = getCategoryCount(cat.id);
            if (count === 0 && !showAllCategories) return null; // Hide empty categories unless showing all
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(String(cat.id))}
                className={`w-full text-left text-[13px] py-1 flex items-center justify-between transition ${category === String(cat.id) ? 'text-theme-primary font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span className="text-[10px] font-mono text-gray-500 border border-theme-border/50 px-1.5 py-0.5 rounded-full min-w-[24px] text-center shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {sortedCategories.length > 6 && (
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-[11px] text-theme-primary hover:text-white transition font-medium"
          >
            {showAllCategories ? '- Ver menos' : `+ Ver todas (${sortedCategories.length})`}
          </button>
        )}
      </div>

      {/* 5. Display Brands */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">Filtrar por Marca</h4>
        <div className="space-y-2 pr-1">
          <label className="flex items-center gap-2.5 text-[13px] text-gray-400 hover:text-white cursor-pointer transition select-none">
            <input 
              type="radio" 
              name="brandFilter"
              checked={brand === ''}
              onChange={() => setBrand('')}
              className="w-3.5 h-3.5 text-theme-primary bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Todas las marcas <span className="text-gray-500 ml-1">({products.length})</span></span>
          </label>
          {visibleBrands.map(b => {
            const count = getBrandCount(b.id);
            if (count === 0 && !showAllBrands) return null;
            return (
              <label 
                key={b.id} 
                className={`flex items-center gap-2.5 text-[13px] cursor-pointer transition select-none ${brand === String(b.id) ? 'text-theme-primary font-medium' : 'text-gray-400 hover:text-white'}`}
              >
                <input 
                  type="radio" 
                  name="brandFilter"
                  checked={brand === String(b.id)}
                  onChange={() => setBrand(String(b.id))}
                  className="w-3.5 h-3.5 text-theme-primary bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="truncate">{b.name} <span className="text-gray-500 ml-1">({count})</span></span>
              </label>
            );
          })}
        </div>
        {sortedBrands.length > 6 && (
          <button 
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="text-[11px] text-theme-primary hover:text-white transition font-medium"
          >
            {showAllBrands ? '- Ver menos' : `+ Ver todas (${sortedBrands.length})`}
          </button>
        )}
      </div>

      {/* 6. Pricing Slider Ranges */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">
          Rango de Precios
        </h4>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <input 
              type="number" 
              placeholder="Mín" 
              className="w-full bg-transparent border-b border-theme-border/70 text-white text-[13px] py-1.5 outline-none focus:border-theme-primary transition"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
            />
            <span className="text-gray-600 font-mono text-[13px]">-</span>
            <input 
              type="number" 
              placeholder="Máx" 
              className="w-full bg-transparent border-b border-theme-border/70 text-white text-[13px] py-1.5 outline-none focus:border-theme-primary transition"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
            />
          </div>
          {/* Quick choices brackets */}
          <div className="flex flex-col gap-1.5">
             <label className="flex items-center gap-2.5 text-[13px] text-theme-primary hover:text-white cursor-pointer transition select-none">
                <input 
                  type="radio" 
                  name="priceBracketFilter"
                  checked={priceMin === '0' && priceMax === '49999'}
                  onChange={() => setPriceBracket('0', '49999')}
                  className="w-3.5 h-3.5 text-theme-primary bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>$0 - $49.999</span>
              </label>
              <label className="flex items-center gap-2.5 text-[13px] text-theme-primary hover:text-white cursor-pointer transition select-none">
                <input 
                  type="radio" 
                  name="priceBracketFilter"
                  checked={priceMin === '50000' && priceMax === '99999'}
                  onChange={() => setPriceBracket('50000', '99999')}
                  className="w-3.5 h-3.5 text-theme-primary bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>$50.000 - $99.999</span>
              </label>
              <label className="flex items-center gap-2.5 text-[13px] text-theme-primary hover:text-white cursor-pointer transition select-none">
                <input 
                  type="radio" 
                  name="priceBracketFilter"
                  checked={priceMin === '100000' && priceMax === ''}
                  onChange={() => setPriceBracket('100000', '')}
                  className="w-3.5 h-3.5 text-theme-primary bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>$100.000 o más</span>
              </label>
              {(priceMin || priceMax) && (
                 <button 
                  onClick={() => setPriceBracket('', '')}
                  className="text-[11px] text-gray-500 hover:text-white transition font-medium self-start mt-1"
                >
                  Limpiar precio
                </button>
              )}
          </div>
        </div>
      </div>

      {/* 7. Product states tags (stock, offers, new) */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-[13px]">Condición del Producto</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-[13px] text-gray-400 hover:text-white cursor-pointer transition select-none">
            <input 
              type="checkbox" 
              checked={filterOffer}
              onChange={e => setFilterOffer(e.target.checked)}
              className="w-3.5 h-3.5 text-theme-primary rounded bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Ofertas Especiales</span>
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-gray-400 hover:text-white cursor-pointer transition select-none">
            <input 
              type="checkbox" 
              checked={filterNew}
              onChange={e => setFilterNew(e.target.checked)}
              className="w-3.5 h-3.5 text-theme-primary rounded bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Nuevos Ingresos</span>
          </label>
          <label className="flex items-center gap-2.5 text-[13px] text-gray-400 hover:text-white cursor-pointer transition select-none">
            <input 
              type="checkbox" 
              checked={filterStock}
              onChange={e => setFilterStock(e.target.checked)}
              className="w-3.5 h-3.5 text-theme-primary rounded bg-transparent border-gray-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>En Stock</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Search Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-theme-border pb-4">
        <div>
          <h1 className="text-3xl font-bebas uppercase tracking-wide text-white">CATÁLOGO DE REPUESTOS</h1>
          <p className="text-gray-400 text-sm font-mono mt-1">
            {filteredProducts.length} productos coincidentes
          </p>
        </div>

        {/* Sort and mobile toggle buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-theme-primary text-white text-xs font-bold px-4 py-3 rounded-lg flex-1 shadow transition"
          >
            <Filter size={14} /> Filtros y Compatibilidad
          </button>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-theme-card border border-theme-border text-white text-xs font-semibold rounded-lg p-3 outline-none focus:border-theme-primary min-w-[180px] shadow-sm appearance-none flex-1 lg:flex-initial"
          >
            <option value="featured">Relevancia</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name-asc">Nombre: A - Z</option>
            <option value="name-desc">Nombre: Z - A</option>
          </select>
        </div>
      </div>

      {/* Main Structural Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 bg-theme-card border border-theme-border p-5 rounded-lg sticky top-24 max-h-[85vh] overflow-y-auto scrollbar-thin">
          <FiltersSidebar />
        </aside>

        {/* Products Display Area */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-10 h-10 border-4 border-theme-element border-t-theme-primary rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse text-sm">Buscando en el catálogo...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-theme-card border border-theme-border p-12 text-center rounded-lg flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-theme-element rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                No hay coincidencias con los filtros de compatibilidad o palabras clave ingresados.
              </p>
              <button 
                onClick={handleClearFilters}
                className="mt-6 bg-theme-primary text-white px-6 py-2.5 rounded font-bold hover:bg-theme-primary-hover transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p: any) => (
                  <motion.div
                    key={p.sku}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Drawer (Visual representation modal for smaller viewports) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileFilters(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-theme-card border-l border-theme-border text-gray-300 flex flex-col shadow-2xl h-full animate-in slide-in-from-right duration-200">
              <div className="px-5 py-4 border-b border-theme-border flex items-center justify-between">
                <h2 className="text-white font-bebas text-xl tracking-wider">Panel Filtros</h2>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
                <FiltersSidebar />
              </div>
              <div className="p-4 border-t border-theme-border bg-theme-base">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white py-3 rounded-lg font-bold text-xs"
                >
                  Ver {filteredProducts.length} Resultados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
