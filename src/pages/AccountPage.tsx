import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut, CheckCircle2, Truck, Clock } from 'lucide-react';
import { formatCLP } from '../lib/utils/formatCLP';

const MOCK_ORDERS = [
  {
    id: 'MX-2024-00001',
    date: '2024-05-10',
    total: 32480,
    status: 'shipped',
    statusLabel: 'En camino'
  },
  {
    id: 'MX-2024-00002',
    date: '2024-04-15',
    total: 8500,
    status: 'delivered',
    statusLabel: 'Entregado'
  }
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos'>('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: '+56 9 1234 5678',
    rut: '12.345.678-9'
  });

  const [editData, setEditData] = useState(userData);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setUserData(editData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Mock logout
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bebas tracking-wide mb-8">MI CUENTA</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors ${activeTab === 'perfil' ? 'bg-[#E31C25] text-white' : 'text-gray-300 hover:bg-[#18181C]'}`}
          >
            <User className="w-5 h-5" /> Mi Perfil
          </button>
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors ${activeTab === 'pedidos' ? 'bg-[#E31C25] text-white' : 'text-gray-300 hover:bg-[#18181C]'}`}
          >
            <Package className="w-5 h-5" /> Mis Pedidos
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#18181C] rounded transition-colors"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </aside>

        <main className="md:col-span-3 space-y-8">
          {activeTab === 'perfil' && (
             <section className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bebas">DATOS PERSONALES</h2>
                 {!isEditing && (
                   <button 
                     onClick={() => { setEditData(userData); setIsEditing(true); }}
                     className="text-[#E31C25] hover:underline text-sm font-bold"
                   >
                     Editar Datos
                   </button>
                 )}
               </div>

               {isEditing ? (
                 <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                        <input 
                          type="text" 
                          value={editData.nombre}
                          onChange={e => setEditData({...editData, nombre: e.target.value})}
                          className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={editData.email}
                          onChange={e => setEditData({...editData, email: e.target.value})}
                          className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                        <input 
                          type="text" 
                          value={editData.telefono}
                          onChange={e => setEditData({...editData, telefono: e.target.value})}
                          className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">RUT</label>
                        <input 
                          type="text" 
                          value={editData.rut}
                          onChange={e => setEditData({...editData, rut: e.target.value})}
                          className="w-full bg-[#0A0A0C] border border-[#1F1F24] rounded p-2 text-white outline-none focus:border-[#E31C25]" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-[#E31C25] text-white rounded font-bold hover:bg-red-700 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                 </form>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                   <div className="bg-[#0A0A0C] p-4 rounded border border-[#1F1F24]">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">Nombre</span>
                     <span className="text-white text-lg">{userData.nombre}</span>
                   </div>
                   <div className="bg-[#0A0A0C] p-4 rounded border border-[#1F1F24]">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">Email</span>
                     <span className="text-white text-lg">{userData.email}</span>
                   </div>
                   <div className="bg-[#0A0A0C] p-4 rounded border border-[#1F1F24]">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">Teléfono</span>
                     <span className="text-white text-lg">{userData.telefono}</span>
                   </div>
                   <div className="bg-[#0A0A0C] p-4 rounded border border-[#1F1F24]">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">RUT</span>
                     <span className="text-white text-lg">{userData.rut}</span>
                   </div>
                 </div>
               )}
             </section>
          )}

          {activeTab === 'pedidos' && (
            <section>
              <h2 className="text-2xl font-bebas mb-6">HISTORIAL DE PEDIDOS</h2>
              <div className="space-y-4">
                {MOCK_ORDERS.map(order => (
                  <div key={order.id} className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-gray-700">
                    <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-[#1F1F24] pb-4 sm:pb-0 sm:pr-8 w-full sm:w-auto">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${order.status === 'delivered' ? 'bg-green-900/30 text-green-500' : 'bg-[#E31C25]/20 text-[#E31C25]'}`}>
                          {order.status === 'delivered' ? <CheckCircle2 className="w-6 h-6" /> : order.status === 'shipped' ? <Truck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                       </div>
                       <div>
                         <h3 className="font-bold text-white text-lg font-mono">{order.id}</h3>
                         <p className="text-sm text-gray-400">Realizado el {order.date}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-1 justify-between items-center w-full sm:pl-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-lg font-bold text-white">{formatCLP(order.total)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-amber-900/50 text-amber-400 border border-amber-800'
                        }`}>
                          {order.statusLabel}
                        </span>
                        <Link to={`/cuenta/pedidos/${order.id}`} className="text-sm text-gray-300 underline hover:text-[#E31C25] transition-colors">
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
