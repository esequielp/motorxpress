import { ShoppingCart, Search, User, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../../store/cart';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartDrawer from '../cart/CartDrawer';
import { useState, useRef, useEffect } from 'react';

const MOCK_RESULTS = [
  { id: '1', sku: 'MX-FLT-001', name: 'KIT FILTROS TOYOTA COROLLA 1.6' },
  { id: '2', sku: 'MX-BUJ-002', name: 'BUJIAS IRIDIUM TOYOTA COROLLA' },
  { id: '3', sku: 'MX-PST-003', name: 'PASTILLAS DE FRENO CERÁMICAS' },
  { id: '4', sku: 'MX-ACE-004', name: 'ACEITE SINTÉTICO 5W30 4L' }
];

export default function Header() {
  const { itemCount, setIsOpen } = useCart();
  const count = itemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string, sku: string, name: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Simulate API search
    if (searchQuery.length > 2) {
      const results = MOCK_RESULTS.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = () => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate('/catalogo');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0C] border-b border-[#1F1F24]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-white font-bebas text-2xl tracking-wider">
              MOTOR<span className="text-[#E31C25]">[X]</span>PRESS
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Busca por marca, modelo o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length > 2) setShowDropdown(true); }}
                className="w-full bg-[#18181C] border border-[#1F1F24] text-white rounded-md pl-4 pr-10 py-2 focus:outline-none focus:border-[#E31C25]"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            {showDropdown && (
              <div className="absolute top-12 left-0 w-full bg-[#18181C] border border-[#1F1F24] rounded-md shadow-xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                     {searchResults.map(result => (
                       <button
                         key={result.id}
                         onClick={handleSelectResult}
                         className="flex items-center gap-3 p-3 hover:bg-[#1F1F24] text-left border-b border-[#1F1F24] last:border-0 transition-colors"
                       >
                         <div>
                            <p className="text-white font-medium text-sm">{result.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{result.sku}</p>
                         </div>
                       </button>
                     ))}
                     <button 
                       onClick={handleSelectResult}
                       className="p-3 bg-[#0A0A0C] text-[#E31C25] text-sm font-bold flex items-center justify-center gap-1 hover:bg-[#1F1F24] transition-colors"
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
            <Link to="/admin" className="text-gray-400 hover:text-[#E31C25] font-bold transition-colors hidden md:block text-sm uppercase tracking-wider" title="Dashboard">
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
                  <span className="absolute -top-2 -right-2 bg-[#E31C25] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1F1F24] p-4 bg-[#0A0A0C]">
             <div className="relative w-full">
              <input
                type="text"
                placeholder="Busca por marca, modelo o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181C] border border-[#1F1F24] text-white rounded-md pl-4 pr-10 py-2 focus:outline-none focus:border-[#E31C25]"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
             <Link 
               to="/cuenta" 
               className="mt-4 flex items-center gap-2 text-gray-300 transition-colors"
               onClick={() => setMobileMenuOpen(false)}
             >
                <User className="w-5 h-5" /> Mi Cuenta
             </Link>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
