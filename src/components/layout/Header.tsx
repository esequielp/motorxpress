import { ShoppingCart, Search, User, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../../store/cart';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartDrawer from '../cart/CartDrawer';
import { useState, useRef, useEffect } from 'react';
import { getProductThumbnail } from '../../lib/utils/image';

export default function Header() {
  const { items, setIsOpen } = useCart();
  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // API search
    if (searchQuery.length > 2) {
      const results = allProducts.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (productId?: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (productId) {
      navigate(`/producto/${productId}`);
    } else {
      navigate('/catalogo');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-theme-base border-b border-theme-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-white font-bebas text-2xl tracking-wider">
              MOTOR<span className="text-theme-primary">[X]</span>PRESS
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={desktopSearchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Busca por marca, modelo o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length > 2) setShowDropdown(true); }}
                className="w-full bg-theme-card border border-theme-border text-white rounded-md pl-4 pr-10 py-2 focus:outline-none focus:border-theme-primary"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            {showDropdown && (
              <div className="absolute top-12 left-0 w-full bg-theme-card border border-theme-border rounded-md shadow-xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                     {searchResults.map(result => (
                       <button
                         key={result.id}
                         onClick={() => handleSelectResult(result.id)}
                         className="flex items-center gap-3 p-3 hover:bg-theme-element text-left border-b border-theme-border last:border-0 transition-colors w-full"
                       >
                         {result.image ? (
                           <img src={getProductThumbnail(result.image)} alt={result.name} className="w-10 h-10 object-cover rounded" />
                         ) : (
                           <div className="w-10 h-10 bg-theme-base rounded flex-shrink-0" />
                         )}
                         <div>
                            <p className="text-white font-medium text-sm">{result.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{result.sku}</p>
                         </div>
                       </button>
                     ))}
                     <button 
                       onClick={() => handleSelectResult()}
                       className="p-3 bg-theme-base text-theme-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-theme-element transition-colors w-full"
                     >
                       Ver todos los resultados <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No se encontraron resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-gray-400 hover:text-theme-primary font-bold transition-colors hidden md:block text-sm uppercase tracking-wider" title="Dashboard">
              Admin
            </Link>
            <Link to="/cuenta" className="text-gray-300 hover:text-white transition-colors hidden md:block" title="Mi Cuenta">
              <User className="w-6 h-6" />
            </Link>
            {!isAdminRoute && (
              <button 
                className="relative text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="w-6 h-6" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-theme-border p-4 bg-theme-base relative shadow-xl z-50 flex flex-col gap-4" ref={mobileSearchRef}>
             <div className="relative w-full">
              <input
                type="text"
                placeholder="Busca por marca, modelo o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length > 2) setShowDropdown(true); }}
                className="w-full bg-theme-card border border-theme-border text-white rounded-md pl-4 pr-10 py-3 focus:outline-none focus:border-theme-primary text-base"
              />
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>

            {showDropdown && (
              <div className="absolute top-[76px] left-4 right-4 bg-theme-card border border-theme-border rounded-md shadow-xl overflow-hidden z-[60]">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                     {searchResults.map(result => (
                       <button
                         key={result.id}
                         onClick={() => { setMobileMenuOpen(false); handleSelectResult(result.id); }}
                         className="flex items-center gap-3 p-3 hover:bg-theme-element text-left border-b border-theme-border last:border-0 transition-colors w-full"
                       >
                         {result.image ? (
                           <img src={getProductThumbnail(result.image)} alt={result.name} className="w-10 h-10 object-cover rounded" />
                         ) : (
                           <div className="w-10 h-10 bg-theme-base rounded flex-shrink-0" />
                         )}
                         <div>
                            <p className="text-white font-medium text-sm line-clamp-1">{result.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{result.sku}</p>
                         </div>
                       </button>
                     ))}
                     <button 
                       onClick={() => { setMobileMenuOpen(false); handleSelectResult(); }}
                       className="p-3 bg-theme-base text-theme-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-theme-element transition-colors w-full"
                     >
                       Ver todos los resultados <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No se encontraron resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            <nav className="flex flex-col gap-2 mt-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-white font-medium hover:bg-theme-card border-b border-theme-border/50 flex items-center justify-between">
                Inicio <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link to="/catalogo" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-white font-medium hover:bg-theme-card border-b border-theme-border/50 flex items-center justify-between">
                Ver Catálogo Completo <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link to="/cuenta" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-white font-medium hover:bg-theme-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" /> Mi Cuenta
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
            </nav>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
