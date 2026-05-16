import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, Settings as SettingsIcon, Plus, Edit, Trash2, Save, X, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useNavigate } from 'react-router-dom';
import { getProductImages } from '../../lib/utils/image';
import { useThemeStore } from '../../store/theme';

function ProductFormModal({ editingProduct, onClose, onSubmit }: any) {
  const [isOffer, setIsOffer] = useState(!!editingProduct?.is_offer);
  const [images, setImages] = useState<string[]>(getProductImages(editingProduct?.image));
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setImages(prev => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-theme-card border border-theme-border rounded-lg max-w-xl w-full p-6 shadow-2xl relative my-auto">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bebas text-white mb-6">
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nombre</label>
                   <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">SKU</label>
                   <input name="sku" defaultValue={editingProduct?.sku} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary font-mono" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">MPN (Número de Parte)</label>
                   <input name="mpn" defaultValue={editingProduct?.mpn || ''} className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary font-mono" placeholder="Opcional" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio</label>
                   <input name="price" type="number" defaultValue={editingProduct?.price || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Costo</label>
                   <input name="cost" type="number" defaultValue={editingProduct?.cost || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Stock</label>
                   <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Vehículo de Compatibilidad</label>
                   <input name="vehicle" defaultValue={editingProduct?.vehicle || 'Universal'} required className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Imágenes del Producto</label>
                   <div className="flex flex-col gap-4 relative">
                     {images.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {images.map((imgUrl, i) => (
                           <div key={i} className="w-24 h-24 rounded bg-theme-base border border-theme-border overflow-hidden relative group">
                             <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                             <button 
                               type="button"
                               onClick={() => setImages(images.filter((_, index) => index !== i))}
                               className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-5 w-5"
                             >
                               <X size={12} />
                             </button>
                             {i === 0 && (
                               <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-center py-0.5 text-white">Principal</span>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                     <div className="flex gap-2 items-center">
                       <input type="hidden" name="image" value={JSON.stringify(images)} />
                       <label className="bg-theme-element hover:bg-[#2A2A35] text-white px-4 py-2 rounded cursor-pointer transition flex items-center justify-center whitespace-nowrap">
                         {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                         <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
                       </label>
                       <span className="text-xs text-gray-500">Puedes subir múltiples imágenes. La primera será la principal.</span>
                     </div>
                   </div>
                 </div>

                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Descripción Técnica</label>
                   <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary resize-none" placeholder="Ingresa la descripción del producto..." />
                 </div>
                 
                 <div className="col-span-2">
                   <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Venta Cruzada Manual (SKU o MPN separados por comas)</label>
                   <input name="cross_sell_ids" defaultValue={editingProduct?.cross_sell_ids || ''} className="w-full bg-theme-base border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary font-mono" placeholder="Ej: MX-FLT-001, FLT-TOY-002" />
                 </div>
                 
                 <div className="col-span-2 flex flex-wrap gap-6 items-center mt-2 p-4 bg-theme-base border border-theme-border rounded-lg">
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_featured" value="1" defaultChecked={editingProduct?.is_featured} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     Destacado (Home)
                   </label>
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_offer" value="1" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     En Oferta
                   </label>
                   <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                     <input type="checkbox" name="is_new" value="1" defaultChecked={editingProduct?.is_new} className="accent-theme-primary w-4 h-4 cursor-pointer" />
                     Recién Llegado
                   </label>
                   
                   {isOffer && (
                     <div className="w-full mt-2 transition-all">
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio de Oferta</label>
                        <input name="offer_price" type="number" defaultValue={editingProduct?.offer_price || ''} className="w-full bg-theme-card border border-theme-border p-2 rounded text-white outline-none focus:border-theme-primary" placeholder="Ej: 15000" />
                     </div>
                   )}
                 </div>
                 <input name="category_id" type="hidden" value="1" />
                 <input name="brand_id" type="hidden" value="1" />
               </div>
               
               <div className="pt-4 flex flex-row-reverse gap-4">
                 <button type="submit" className="bg-theme-primary text-white px-6 py-2 rounded font-bold hover:bg-theme-primary-hover transition">
                   {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                 </button>
                 <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold transition">
                   Cancelar
                 </button>
               </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'staff' | 'customers'>('all');

  // Filtering & Pagination State
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 8;

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);

  const [userSearchText, setUserSearchText] = useState('');
  const [userPage, setUserPage] = useState(1);

  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [newsletterPage, setNewsletterPage] = useState(1);

  // Computed state
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );
  const paginatedProducts = filteredProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const filteredOrders = orders.filter(o => 
    (o.id.toString().includes(orderSearch) || 
     o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || 
     o.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) &&
    (orderStatusFilter === 'all' || o.status === orderStatusFilter)
  );
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const activeUsers = users.filter((u: any) => userFilter === 'all' || (userFilter === 'staff' && (u.role === 'admin' || u.role === 'ejecutivo')) || (userFilter === 'customers' && u.role === 'customer'));
  const filteredUsers = activeUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
    u.id.toString().includes(userSearchText)
  );
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const mockNewsletters = [
    { email: 'juan.perez@example.com', date: '10 May 2026', status: 'Activo' },
    { email: 'maria_c89@gmail.com', date: '11 May 2026', status: 'Activo' },
    { email: 'luis.mecanica@taller.cl', date: '12 May 2026', status: 'Activo' },
    { email: 'carlos123@hotmail.com', date: '13 May 2026', status: 'Desuscrito' },
    { email: 'ana.silva@empresa.com', date: '14 May 2026', status: 'Activo' },
    { email: 'roberto_xd@live.com', date: '14 May 2026', status: 'Activo' },
    { email: 'sofia.taller3x@gmail.com', date: '15 May 2026', status: 'Activo' },
    { email: 'miguel.lopez99@yahoo.com', date: '15 May 2026', status: 'Desuscrito' },
    { email: 'valeria_motors@gmail.com', date: '15 May 2026', status: 'Activo' },
  ];
  
  const filteredNewsletters = mockNewsletters.filter(n => n.email.toLowerCase().includes(newsletterSearch.toLowerCase()) || n.status.toLowerCase().includes(newsletterSearch.toLowerCase()));
  const paginatedNewsletters = filteredNewsletters.slice((newsletterPage - 1) * itemsPerPage, newsletterPage * itemsPerPage);
  const totalNewsletterPages = Math.ceil(filteredNewsletters.length / itemsPerPage) || 1;


  // Modals state
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Compute Dashboard Metrics
  const totalRevenue = orders.reduce((acc, current) => {
    if (current.status !== 'cancelled' && current.status !== 'rejected') {
      return acc + current.total;
    }
    return acc;
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const chartData = [
    { name: 'Lun', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Mar', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Mié', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Jue', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Vie', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Sáb', ventas: Math.floor(Math.random() * 500000) + 100000 },
    { name: 'Dom', ventas: Math.floor(Math.random() * 500000) + 100000 },
  ];

  useEffect(() => {
    const savedUserStr = localStorage.getItem('motorxpress_user');
    if (savedUserStr) {
      const u = JSON.parse(savedUserStr);
      if (u.role === 'admin' || u.role === 'ejecutivo') {
        setCurrentUser(u);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }

    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : []));
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d || {}));
  }, []);

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (editingUser) {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
    } else {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setUsers([{ id: result.id, ...data, created_at: new Date().toISOString() }, ...users]);
    }
    setUserModalOpen(false);
    setEditingUser(null);
  };


  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Error en el servidor');
      if (settings.theme) {
        setTheme(settings.theme);
      }
      setSaveSuccess('Configuraciones guardadas exitosamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error de red al guardar');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // cast numbers
    data.price = Number(data.price);
    data.cost = Number(data.cost) || 0;
    data.stock = Number(data.stock);
    if (data.offer_price) {
      data.offer_price = Number(data.offer_price);
    } else {
      data.offer_price = null;
    }

    data.is_featured = formData.get('is_featured') ? 1 : 0;
    data.is_offer = formData.get('is_offer') ? 1 : 0;
    data.is_new = formData.get('is_new') ? 1 : 0;

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setProducts([...products, { id: result.id, ...data }]);
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h1 className="text-3xl font-bebas mb-6 text-theme-primary">Admin Dashboard</h1>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-theme-primary/10 p-4 rounded-full text-theme-primary">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Productos</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-blue-500/10 p-4 rounded-full text-blue-500">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Órdenes</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-green-500/10 p-4 rounded-full text-green-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Usuarios</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
        <div className="bg-theme-card p-6 rounded-lg border border-theme-border flex items-center gap-4 hover:border-theme-border-hover transition">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-500">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
            <p className="text-xl font-bold">${totalRevenue.toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-theme-border mb-6 overflow-x-auto select-none no-scrollbar">
        {['dashboard', 'products', 'orders', 'users', 'customers', 'newsletter', 'settings'].map(tab => (
          <button 
            key={tab}
            onClick={() => {
              if (tab === 'users') {
                 setActiveTab('users');
                 setUserFilter('staff');
              } else if (tab === 'customers') {
                 setActiveTab('users');
                 setUserFilter('customers');
              } else {
                 setActiveTab(tab);
                 if (tab === 'products' || tab === 'orders' || tab === 'settings' || tab === 'dashboard' || tab === 'newsletter') {
                    setUserFilter('all'); // reset or ignore
                 }
              }
            }}
            className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap capitalize ${
              (tab === 'users' && activeTab === 'users' && userFilter === 'staff') ||
              (tab === 'customers' && activeTab === 'users' && userFilter === 'customers') ||
              (tab !== 'users' && tab !== 'customers' && activeTab === tab)
                ? 'border-b-2 border-theme-primary text-theme-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'dashboard' ? 'Resumen' : tab === 'products' ? 'Productos' : tab === 'orders' ? 'Órdenes' : tab === 'users' ? 'Admin. Staff' : tab === 'customers' ? 'Clientes' : tab === 'newsletter' ? 'Suscriptores Boletín' : 'Configuración'}
          </button>
        ))}
      </div>

      {/* Dashboard Resumen Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart */}
            <div className="bg-theme-card border border-theme-border rounded-lg p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp size={18} className="text-theme-primary" /> Ventas (Últimos 7 días)</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--theme-primary)' }}
                      formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="var(--theme-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock products */}
            <div className="bg-theme-card border border-theme-border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                Control de Stock
              </h3>
              
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Todos los productos tienen buen stock.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-theme-base rounded border border-theme-border">
                      <div className="flex items-center gap-3">
                        <img src={getProductImages(p.image)[0] || 'https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=150&q=80'} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${p.stock === 0 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {p.stock} uni.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-theme-card border border-theme-border rounded-lg">
            <div className="p-4 border-b border-theme-border">
              <h3 className="font-bold text-lg">Órdenes Recientes</h3>
            </div>
            {recentOrders.length === 0 ? (
               <div className="text-center py-8 text-gray-500">Aún no hay órdenes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-theme-base text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id} className="border-b border-theme-border hover:bg-theme-element/50">
                        <td className="px-6 py-3 text-white font-mono text-xs">#{o.id}</td>
                        <td className="px-6 py-3">
                          <p className="text-white text-sm">{o.customer_name}</p>
                        </td>
                        <td className="px-6 py-3 text-xs">{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
                        <td className="px-6 py-3 font-bold text-white">${o.total.toLocaleString('es-CL')}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            o.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                            o.status === 'paid' ? 'bg-blue-900/40 text-blue-400' :
                            o.status === 'pending' ? 'bg-yellow-900/40 text-yellow-500' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Catálogo <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre o SKU..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
              />
              <button 
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition"
              >
                <Plus size={16} /> Añadir Producto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">SKU / MPN</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Costo</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Precio Oferta</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => (
                    <tr key={p.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4 font-mono text-xs">
                        <div>{p.sku}</div>
                        {p.mpn && <div className="text-gray-500 mt-1">{p.mpn}</div>}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-gray-400">
                        ${(p.cost || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={p.is_offer ? "line-through text-gray-500" : ""}>
                          ${p.price.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-theme-primary font-bold">
                        {p.is_offer && p.offer_price ? `$${p.offer_price.toLocaleString('es-CL')}` : '-'}
                      </td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button 
                          onClick={() => { setEditingProduct(p); setProductModalOpen(true); }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-theme-primary hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedProducts.length} de {filteredProducts.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setProductPage(Math.max(1, productPage - 1))}
                disabled={productPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{productPage} / {totalProductPages}</span>
              <button 
                onClick={() => setProductPage(Math.min(totalProductPages, productPage + 1))}
                disabled={productPage === totalProductPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Órdenes <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por ID, nombre o email..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
              />
              <select 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary"
                value={orderStatusFilter}
                onChange={e => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pago Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Orden ID</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay órdenes para mostrar.</td>
                  </tr>
                ) : (
                  paginatedOrders.map(o => (
                    <tr key={o.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4 text-white font-mono">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-white">{o.customer_name}</p>
                        <p className="text-xs">{o.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={o.shipping_address}>{o.shipping_address}</td>
                      <td className="px-6 py-4 font-bold text-white">${o.total.toLocaleString('es-CL')}</td>
                      <td className="px-6 py-4">
                        <select 
                          className={`border border-theme-border text-xs font-bold rounded px-2 py-1 outline-none ${
                            o.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                            o.status === 'paid' ? 'bg-blue-900/40 text-blue-400' :
                            o.status === 'shipped' ? 'bg-purple-900/40 text-purple-400' :
                            o.status === 'cancelled' || o.status === 'rejected' ? 'bg-red-900/40 text-red-500' :
                            'bg-yellow-900/40 text-yellow-500'
                          }`}
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        >
                          <option className="bg-theme-base text-white" value="pending">Pago Pendiente</option>
                          <option className="bg-theme-base text-white" value="paid">Pago Confirmado (Pagado)</option>
                          <option className="bg-theme-base text-white" value="shipped">Envío en Camino</option>
                          <option className="bg-theme-base text-white" value="delivered">Entregado</option>
                          <option className="bg-theme-base text-white" value="cancelled">Cancelado</option>
                          <option className="bg-theme-base text-white" value="rejected">Pago Rechazado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(o.created_at).toLocaleString('es-CL')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedOrders.length} de {filteredOrders.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
                disabled={orderPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{orderPage} / {totalOrderPages}</span>
              <button 
                onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage + 1))}
                disabled={orderPage === totalOrderPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              {userFilter === 'customers' ? 'Gestión de Clientes' : 'Gestión de Staff'} <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre, email o ID..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={userSearchText}
                onChange={e => { setUserSearchText(e.target.value); setUserPage(1); }}
              />
              <button 
                onClick={() => { setEditingUser(null); setUserModalOpen(true); }}
                className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition"
              >
                <Plus size={16} /> Añadir {userFilter === 'customers' ? 'Cliente' : 'Usuario Staff'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Registro</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios.</td>
                  </tr>
                ) : (
                  paginatedUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-theme-border hover:bg-theme-element/50">
                      <td className="px-6 py-4 font-mono text-xs text-white">#{u.id}</td>
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">{u.name.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : u.role === 'ejecutivo' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(u.created_at).toLocaleDateString('es-CL')}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button 
                          onClick={() => { setEditingUser(u); setUserModalOpen(true); }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-theme-primary hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedUsers.length} de {filteredUsers.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{userPage} / {totalUserPages}</span>
              <button 
                onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                disabled={userPage === totalUserPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Panel */}
      {activeTab === 'newsletter' && (
        <div className="bg-theme-card border border-theme-border rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              Suscriptores al Boletín (Mock) <span className="text-sm font-normal text-gray-500 bg-theme-base px-2 py-0.5 rounded-full">{filteredNewsletters.length}</span>
            </h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por email..." 
                className="bg-theme-base border border-theme-border text-white text-sm rounded px-3 py-2 outline-none focus:border-theme-primary min-w-[250px]"
                value={newsletterSearch}
                onChange={e => { setNewsletterSearch(e.target.value); setNewsletterPage(1); }}
              />
              <button className="bg-theme-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-theme-primary-hover transition">
                Exportar CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-theme-base text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Fecha de Suscripción</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {paginatedNewsletters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">No se encontraron suscriptores</td>
                  </tr>
                ) : (
                  paginatedNewsletters.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-theme-element transition">
                      <td className="px-6 py-4 font-medium text-white">{sub.email}</td>
                      <td className="px-6 py-4">{sub.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${sub.status === 'Activo' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-theme-border flex justify-between items-center bg-theme-base">
            <span className="text-gray-500 text-sm">Mostrando {paginatedNewsletters.length} de {filteredNewsletters.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setNewsletterPage(Math.max(1, newsletterPage - 1))}
                disabled={newsletterPage === 1}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-theme-element rounded">{newsletterPage} / {totalNewsletterPages}</span>
              <button 
                onClick={() => setNewsletterPage(Math.min(totalNewsletterPages, newsletterPage + 1))}
                disabled={newsletterPage === totalNewsletterPages}
                className="px-3 py-1 bg-theme-card border border-theme-border rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="bg-theme-card border border-theme-border rounded-lg p-6 max-w-2xl">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <SettingsIcon size={20} className="text-theme-primary" /> Configuración de Plataforma
          </h2>

          {saveSuccess && <div className="mb-4 bg-green-500/20 text-green-400 p-3 rounded border border-green-500/30 font-medium text-sm">{saveSuccess}</div>}
          {saveError && <div className="mb-4 bg-red-500/20 text-red-400 p-3 rounded border border-red-500/30 font-medium text-sm">{saveError}</div>}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* UI Theme Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Apariencia (Theme)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Tema Global (Paleta de Colores)</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.theme || theme}
                    onChange={e => {
                      setTheme(e.target.value as any);
                      setSettings({ ...settings, theme: e.target.value });
                    }}
                  >
                    <option value="racing">Racing Base (Negro / Rojo Motor)</option>
                    <option value="corporate">Corporativo (Azul Marino / Azul Vivo)</option>
                    <option value="modern">Moderno Eco (Gris Oscuro / Esmeralda)</option>
                    <option value="enterprise">Empresarial (Púrpura / Violeta)</option>
                    <option value="marketplace">Marketplace (Claro / Amarillo y Rojo)</option>
                    <option value="minimal">Minimalista (Oscuro / Platinado)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Integración de Pagos (Flow.cl)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Estado de Pasarela</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.payment_method || 'flow'}
                    onChange={e => setSettings({...settings, payment_method: e.target.value})}
                  >
                    <option value="test">Testing (Sandbox)</option>
                    <option value="flow">Flow.cl Producción</option>
                    <option value="transfer">Transferencia Bancaria Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Flow API Key</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su API KEY de Flow"
                    value={settings.flow_api_key || ''}
                    onChange={e => setSettings({...settings, flow_api_key: e.target.value})}
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Flow Secret</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su Secret de Flow"
                    value={settings.flow_secret || ''}
                    onChange={e => setSettings({...settings, flow_secret: e.target.value})}
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="bg-theme-base rounded p-4 border border-theme-border">
              <h3 className="font-bold text-white mb-4">Integración de Envíos (Chilexpress)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Método por defecto</label>
                  <select 
                    className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary"
                    value={settings.shipping_method || 'chilexpress'}
                    onChange={e => setSettings({...settings, shipping_method: e.target.value})}
                  >
                    <option value="chilexpress">Calculadora Chilexpress (API)</option>
                    <option value="flat">Tarifa Plana ($3.990) - Starken / Blue / etc.</option>
                    <option value="free">Envío Gratis MKT</option>
                  </select>
                </div>
                {settings.shipping_method === 'chilexpress' && (
                  <div>
                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Chilexpress TCC Key</label>
                    <input 
                      type="password" 
                      placeholder="Subscription Key"
                      value={settings.chx_key || ''}
                      onChange={e => setSettings({...settings, chx_key: e.target.value})}
                      className="w-full bg-theme-card border border-theme-border text-white p-2 text-sm rounded outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2 px-6 rounded transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <ProductFormModal 
          editingProduct={editingProduct} 
          onClose={() => setProductModalOpen(false)} 
          onSubmit={handleProductSubmit} 
        />
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-card border border-theme-border rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
              <button onClick={() => setUserModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input 
                  name="name"
                  type="text" 
                  defaultValue={editingUser?.name}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                <input 
                  name="email"
                  type="email" 
                  defaultValue={editingUser?.email}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                  <input 
                    name="password"
                    type="password" 
                    className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select 
                  name="role"
                  defaultValue={editingUser?.role || 'customer'}
                  className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary"
                >
                  <option value="customer">Cliente</option>
                  <option value="ejecutivo">Ejecutivo de Ventas</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 bg-theme-element text-white py-2 rounded font-bold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-theme-primary text-white py-2 rounded font-bold hover:bg-theme-primary-hover transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
