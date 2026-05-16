import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut, CheckCircle2, Truck, Clock, LogIn, UserPlus } from 'lucide-react';
import { formatCLP } from '../lib/utils/formatCLP';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos'>('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('motorxpress_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      fetchUserOrders(user.id);
    }
  }, []);

  const fetchUserOrders = async (userId: number) => {
    try {
      const res = await fetch(`/api/orders/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('motorxpress_user', JSON.stringify(user));
          setCurrentUser(user);
          fetchUserOrders(user.id);
        } else {
          setAuthError('Credenciales incorrectas');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
        });
        if (res.ok) {
          const { id } = await res.json();
          const user = { id, name: authName, email: authEmail, role: 'customer' };
          localStorage.setItem('motorxpress_user', JSON.stringify(user));
          setCurrentUser(user);
          fetchUserOrders(user.id);
        } else {
          setAuthError('Error al crear cuenta');
        }
      }
    } catch (err) {
      setAuthError('Error de red');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('motorxpress_user');
    setCurrentUser(null);
    setOrders([]);
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="bg-theme-card border border-theme-border rounded-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bebas text-center text-theme-primary mb-6">
            {authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </h2>
          
          {authError && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-center text-sm">{authError}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  className="w-full bg-theme-base border border-theme-border rounded p-3 text-white outline-none focus:border-theme-primary" 
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full bg-theme-base border border-theme-border rounded p-3 text-white outline-none focus:border-theme-primary" 
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full bg-theme-base border border-theme-border rounded p-3 text-white outline-none focus:border-theme-primary" 
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-3 rounded transition-colors flex justify-center items-center gap-2"
            >
              {authMode === 'login' ? <><LogIn size={18} /> Entrar</> : <><UserPlus size={18} /> Registrarse</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-gray-400 hover:text-white"
            >
              {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentUser.name, email: currentUser.email, role: currentUser.role })
      });
      if (res.ok) {
        setIsEditing(false);
        localStorage.setItem('motorxpress_user', JSON.stringify(currentUser));
        alert('Perfil guardado');
      }
    } catch {
      alert('Error saving profile');
    }
  };

  const statusMap: Record<string, { label: string, icon: any, color: string }> = {
    pending: { label: 'Pago Pendiente', icon: Clock, color: 'bg-yellow-900/30 text-yellow-500 border-yellow-800' },
    paid: { label: 'Pago Confirmado', icon: CheckCircle2, color: 'bg-green-900/30 text-green-500 border-green-800' },
    shipped: { label: 'En Camino', icon: Truck, color: 'bg-blue-900/30 text-blue-500 border-blue-800' },
    delivered: { label: 'Entregado', icon: CheckCircle2, color: 'bg-green-900/30 text-green-500 border-green-800' },
    cancelled: { label: 'Cancelado', icon: Clock, color: 'bg-red-900/30 text-red-500 border-red-800' },
    rejected: { label: 'Pago Rechazado', icon: Clock, color: 'bg-red-900/30 text-red-500 border-red-800' }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bebas tracking-wide mb-8">MI CUENTA</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors ${activeTab === 'perfil' ? 'bg-theme-primary text-white' : 'text-gray-300 hover:bg-theme-card'}`}
          >
            <User className="w-5 h-5" /> Mi Perfil
          </button>
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors ${activeTab === 'pedidos' ? 'bg-theme-primary text-white' : 'text-gray-300 hover:bg-theme-card'}`}
          >
            <Package className="w-5 h-5" /> Mis Pedidos
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'ejecutivo') && (
            <Link 
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded font-bold transition-colors"
            >
              Panel de Administración
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-theme-card rounded transition-colors"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </aside>

        <main className="md:col-span-3 space-y-8">
          {activeTab === 'perfil' && (
             <section className="bg-theme-card border border-theme-border rounded-lg p-6">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bebas">DATOS PERSONALES</h2>
                 {!isEditing && (
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="text-theme-primary hover:underline text-sm font-bold"
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
                          value={currentUser.name}
                          onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                          className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={currentUser.email}
                          onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                          className="w-full bg-theme-base border border-theme-border rounded p-2 text-white outline-none focus:border-theme-primary" 
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-theme-element text-white border-0 rounded hover:bg-theme-primary transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-theme-primary text-white rounded font-bold hover:bg-theme-primary-hover transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                 </form>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                   <div className="bg-theme-base p-4 rounded border border-theme-border">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">Nombre</span>
                     <span className="text-white text-lg">{currentUser.name}</span>
                   </div>
                   <div className="bg-theme-base p-4 rounded border border-theme-border">
                     <span className="block text-gray-500 mb-1 uppercase text-xs font-bold tracking-wider">Email</span>
                     <span className="text-white text-lg">{currentUser.email}</span>
                   </div>
                 </div>
               )}
             </section>
          )}

          {activeTab === 'pedidos' && (
            <section>
              <h2 className="text-2xl font-bebas mb-6">HISTORIAL DE PEDIDOS</h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-theme-card border border-theme-border rounded-lg">
                    No has realizado ningún pedido aún.
                  </div>
                ) : orders.map(order => {
                  const statusInfo = statusMap[order.status] || statusMap.pending;
                  const Icon = statusInfo.icon;
                  return (
                    <div key={order.id} className="bg-theme-card border border-theme-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-theme-border-hover">
                      <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-theme-border pb-4 sm:pb-0 sm:pr-8 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.color}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg font-mono">#{order.id}</h3>
                          <p className="text-sm text-gray-400">Realizado el {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 justify-between items-center w-full sm:pl-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                          <p className="text-lg font-bold text-white">{formatCLP(order.total)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <Link to={`/cuenta/pedidos/${order.id}`} className="text-sm text-gray-300 underline hover:text-theme-primary transition-colors">
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
