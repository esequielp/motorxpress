import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, Settings as SettingsIcon, Plus, Edit, Trash2, Save, X } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('products');
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


  // Modals state
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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

    fetch('/api/products').then(r => r.json()).then(setProducts);
    fetch('/api/orders').then(r => r.json()).then(setOrders);
    fetch('/api/users').then(r => r.json()).then(setUsers);
    fetch('/api/settings').then(r => r.json()).then(setSettings);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    alert('Configuraciones guardadas');
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // cast numbers
    data.price = Number(data.price);
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
      <h1 className="text-3xl font-bebas mb-6 text-[#E31C25]">Admin Dashboard</h1>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24] flex items-center gap-4">
          <div className="bg-[#E31C25]/10 p-4 rounded-full text-[#E31C25]">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Productos</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24] flex items-center gap-4">
          <div className="bg-blue-500/10 p-4 rounded-full text-blue-500">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Órdenes</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
        <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24] flex items-center gap-4">
          <div className="bg-green-500/10 p-4 rounded-full text-green-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Usuarios</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
        <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24] flex items-center gap-4">
          <div className="bg-purple-500/10 p-4 rounded-full text-purple-500">
            <SettingsIcon size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Integraciones</p>
            <p className="text-2xl font-bold">Activas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#1F1F24] mb-6 overflow-x-auto">
        {['products', 'orders', 'users', 'customers', 'settings'].map(tab => (
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
                 if (tab === 'products' || tab === 'orders' || tab === 'settings') {
                    setUserFilter('all'); // reset or ignore
                 }
              }
            }}
            className={`pb-2 px-4 transition-colors whitespace-nowrap capitalize ${activeTab === tab || (activeTab === 'users' && tab === 'users' && userFilter === 'staff') || (activeTab === 'users' && tab === 'customers' && userFilter === 'customers') ? 'border-b-2 border-[#E31C25] text-[#E31C25]' : 'text-gray-400 hover:text-white'}`}
          >
            {tab === 'products' ? 'Productos' : tab === 'orders' ? 'Órdenes' : tab === 'users' ? 'Admin. Staff' : tab === 'customers' ? 'Clientes' : 'Configuración'}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-[#1F1F24] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg">Catálogo (<span className="text-[#E31C25]">{filteredProducts.length}</span>)</h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre o SKU..." 
                className="bg-[#0A0A0C] border border-[#1F1F24] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#E31C25] min-w-[250px]"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
              />
              <button 
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                className="bg-[#E31C25] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition"
              >
                <Plus size={16} /> Añadir Producto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0A0A0C] text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">SKU / MPN</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Precio Oferta</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => (
                    <tr key={p.id} className="border-b border-[#1F1F24] hover:bg-[#1F1F24]/50">
                      <td className="px-6 py-4 font-mono text-xs">
                        <div>{p.sku}</div>
                        {p.mpn && <div className="text-gray-500 mt-1">{p.mpn}</div>}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className={p.is_offer ? "line-through text-gray-500" : ""}>
                          ${p.price.toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#E31C25] font-bold">
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
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-[#E31C25] hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#1F1F24] flex justify-between items-center bg-[#0A0A0C]">
            <span className="text-gray-500 text-sm">Mostrando {paginatedProducts.length} de {filteredProducts.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setProductPage(Math.max(1, productPage - 1))}
                disabled={productPage === 1}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-[#1F1F24] rounded">{productPage} / {totalProductPages}</span>
              <button 
                onClick={() => setProductPage(Math.min(totalProductPages, productPage + 1))}
                disabled={productPage === totalProductPages}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-[#1F1F24] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg">Órdenes (<span className="text-[#E31C25]">{filteredOrders.length}</span>)</h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por ID, nombre o email..." 
                className="bg-[#0A0A0C] border border-[#1F1F24] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#E31C25] min-w-[250px]"
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
              />
              <select 
                className="bg-[#0A0A0C] border border-[#1F1F24] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#E31C25]"
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
              <thead className="bg-[#0A0A0C] text-xs uppercase">
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
                    <tr key={o.id} className="border-b border-[#1F1F24] hover:bg-[#1F1F24]/50">
                      <td className="px-6 py-4 text-white font-mono">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-white">{o.customer_name}</p>
                        <p className="text-xs">{o.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={o.shipping_address}>{o.shipping_address}</td>
                      <td className="px-6 py-4 font-bold text-white">${o.total.toLocaleString('es-CL')}</td>
                      <td className="px-6 py-4">
                        <select 
                          className={`border border-[#1F1F24] text-xs font-bold rounded px-2 py-1 outline-none ${
                            o.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                            o.status === 'paid' ? 'bg-blue-900/40 text-blue-400' :
                            o.status === 'shipped' ? 'bg-purple-900/40 text-purple-400' :
                            o.status === 'cancelled' || o.status === 'rejected' ? 'bg-red-900/40 text-red-500' :
                            'bg-yellow-900/40 text-yellow-500'
                          }`}
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        >
                          <option className="bg-[#0A0A0C] text-white" value="pending">Pago Pendiente</option>
                          <option className="bg-[#0A0A0C] text-white" value="paid">Pago Confirmado (Pagado)</option>
                          <option className="bg-[#0A0A0C] text-white" value="shipped">Envío en Camino</option>
                          <option className="bg-[#0A0A0C] text-white" value="delivered">Entregado</option>
                          <option className="bg-[#0A0A0C] text-white" value="cancelled">Cancelado</option>
                          <option className="bg-[#0A0A0C] text-white" value="rejected">Pago Rechazado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(o.created_at).toLocaleString('es-CL')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#1F1F24] flex justify-between items-center bg-[#0A0A0C]">
            <span className="text-gray-500 text-sm">Mostrando {paginatedOrders.length} de {filteredOrders.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
                disabled={orderPage === 1}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-[#1F1F24] rounded">{orderPage} / {totalOrderPages}</span>
              <button 
                onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage + 1))}
                disabled={orderPage === totalOrderPages}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-[#1F1F24] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg">{userFilter === 'customers' ? `Gestión de Clientes (${filteredUsers.length})` : `Gestión de Staff (${filteredUsers.length})`}</h2>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre, email o ID..." 
                className="bg-[#0A0A0C] border border-[#1F1F24] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#E31C25] min-w-[250px]"
                value={userSearchText}
                onChange={e => { setUserSearchText(e.target.value); setUserPage(1); }}
              />
              <button 
                onClick={() => { setEditingUser(null); setUserModalOpen(true); }}
                className="bg-[#E31C25] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition"
              >
                <Plus size={16} /> Añadir {userFilter === 'customers' ? 'Cliente' : 'Usuario Staff'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0A0A0C] text-xs uppercase">
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
                    <tr key={u.id} className="border-b border-[#1F1F24] hover:bg-[#1F1F24]/50">
                      <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">{u.name.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : u.role === 'ejecutivo' ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-700 text-gray-300'}`}>
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
                        <button onClick={() => handleDeleteUser(u.id)} className="text-[#E31C25] hover:text-red-400 transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#1F1F24] flex justify-between items-center bg-[#0A0A0C]">
            <span className="text-gray-500 text-sm">Mostrando {paginatedUsers.length} de {filteredUsers.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Anterior</button>
              <span className="px-3 py-1 text-sm bg-[#1F1F24] rounded">{userPage} / {totalUserPages}</span>
              <button 
                onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                disabled={userPage === totalUserPages}
                className="px-3 py-1 bg-[#18181C] border border-[#1F1F24] rounded text-sm disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 max-w-2xl">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <SettingsIcon size={20} className="text-[#E31C25]" /> Configuración de Plataforma
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Payment Section */}
            <div className="bg-[#0A0A0C] rounded p-4 border border-[#1F1F24]">
              <h3 className="font-bold text-white mb-4">Integración de Pagos (Flow.cl)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Estado de Pasarela</label>
                  <select 
                    className="w-full bg-[#18181C] border border-[#1F1F24] text-white p-2 text-sm rounded outline-none focus:border-[#E31C25]"
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
                    className="w-full bg-[#18181C] border border-[#1F1F24] text-white p-2 text-sm rounded outline-none focus:border-[#E31C25] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Flow Secret</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su Secret de Flow"
                    value={settings.flow_secret || ''}
                    onChange={e => setSettings({...settings, flow_secret: e.target.value})}
                    className="w-full bg-[#18181C] border border-[#1F1F24] text-white p-2 text-sm rounded outline-none focus:border-[#E31C25] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="bg-[#0A0A0C] rounded p-4 border border-[#1F1F24]">
              <h3 className="font-bold text-white mb-4">Integración de Envíos (Chilexpress)</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Método por defecto</label>
                  <select 
                    className="w-full bg-[#18181C] border border-[#1F1F24] text-white p-2 text-sm rounded outline-none focus:border-[#E31C25]"
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
                      className="w-full bg-[#18181C] border border-[#1F1F24] text-white p-2 text-sm rounded outline-none focus:border-[#E31C25] font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-[#E31C25] hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg max-w-xl w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bebas text-white mb-6">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nombre</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">SKU</label>
                  <input name="sku" defaultValue={editingProduct?.sku} required className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25] font-mono" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">MPN (Número de Parte)</label>
                  <input name="mpn" defaultValue={editingProduct?.mpn || ''} className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25] font-mono" placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price || 0} required className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Vehículo de Compatibilidad</label>
                  <input name="vehicle" defaultValue={editingProduct?.vehicle || 'Universal'} required className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">URL de Imagen</label>
                  <input name="image" defaultValue={editingProduct?.image || 'https://images.unsplash.com/photo-1599905973801-1b913e2fcece?auto=format&fit=crop&w=400&q=80'} className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Descripción Técnica</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} className="w-full bg-[#0A0A0C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25] resize-none" placeholder="Ingresa la descripción del producto..." />
                </div>
                
                <div className="col-span-2 flex flex-wrap gap-6 items-center mt-2 p-4 bg-[#0A0A0C] border border-[#1F1F24] rounded-lg">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" name="is_featured" value="1" defaultChecked={editingProduct?.is_featured} className="accent-[#E31C25] w-4 h-4 cursor-pointer" />
                    Destacado (Home)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" name="is_offer" value="1" defaultChecked={editingProduct?.is_offer} className="accent-[#E31C25] w-4 h-4 cursor-pointer" onChange={(e) => {
                      const offerInput = document.getElementById('offer_price_input');
                      if (offerInput) offerInput.style.display = e.target.checked ? 'block' : 'none';
                    }}/>
                    En Oferta
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" name="is_new" value="1" defaultChecked={editingProduct?.is_new} className="accent-[#E31C25] w-4 h-4 cursor-pointer" />
                    Recién Llegado
                  </label>
                  
                  <div id="offer_price_input" style={{ display: editingProduct?.is_offer ? 'block' : 'none' }} className="w-full mt-2">
                     <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Precio de Oferta</label>
                     <input name="offer_price" type="number" defaultValue={editingProduct?.offer_price || ''} className="w-full bg-[#18181C] border border-[#1F1F24] p-2 rounded text-white outline-none focus:border-[#E31C25]" placeholder="Ej: 15000" />
                  </div>
                </div>
                {/* Normally we'd use select for categories/brands, keeping it simple as numbers for now or leaving blank will hit constraints maybe, let's omit unless strictly wanted */}
                <input name="category_id" type="hidden" value="1" />
                <input name="brand_id" type="hidden" value="1" />
              </div>
              
              <div className="pt-4 flex flex-row-reverse gap-4">
                <button type="submit" className="bg-[#E31C25] text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-bold transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg w-full max-w-md p-6">
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
                  className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                <input 
                  name="email"
                  type="email" 
                  defaultValue={editingUser?.email}
                  className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                  <input 
                    name="password"
                    type="password" 
                    className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select 
                  name="role"
                  defaultValue={editingUser?.role || 'customer'}
                  className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]"
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
                  className="flex-1 bg-[#1F1F24] text-white py-2 rounded font-bold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#E31C25] text-white py-2 rounded font-bold hover:bg-red-700 transition"
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
