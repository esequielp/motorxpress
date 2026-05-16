import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle2, Truck, ArrowLeft, Clock, Download } from 'lucide-react';
import { formatCLP } from '../lib/utils/formatCLP';
import { useEffect, useState } from 'react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Map DB structure to what UI expects
          setOrder({
            id: data.id,
            date: new Date(data.created_at).toLocaleString(),
            status: data.status,
            trackingNumber: data.status === 'shipped' || data.status === 'delivered' ? `OT-MX-${data.id * 1234}` : null,
            shippingAddress: data.shipping_address,
            // we don't have separate shipping/subtotal in db, so we fake the split for now
            subtotal: data.total - 5990,
            shipping: 5990,
            total: data.total,
            items: data.items.map((i: any) => ({
              sku: i.product_id ? `MX-PRD-${i.product_id}` : 'MX-GEN-001',
              name: i.product_name,
              qty: i.quantity,
              price: i.price
            }))
          });
        } else {
           // Fallback if not found
           setOrder(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (order === null) {
    return <div className="container mx-auto px-4 py-20 text-center text-white">Cargando pedido o pedido no encontrado...</div>;
  }

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Boleta descargada exitosamente (Simulación)");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Link to="/cuenta" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-wide mb-1">PEDIDO {order.id}</h1>
          <p className="text-gray-400 font-mono text-sm">{order.date}</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-theme-element hover:bg-theme-primary text-white border-0 px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Generando PDF...' : 'Descargar Boleta'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-theme-card border border-theme-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-theme-primary" /> Estado del Envío</h2>
            
            {order.status === 'cancelled' || order.status === 'rejected' ? (
              <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-red-900/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Pedido {order.status === 'rejected' ? 'Rechazado' : 'Cancelado'}</h3>
                <p className="text-gray-400">
                  {order.status === 'rejected' 
                    ? 'Hubo un problema procesando tu pago. Por favor, intenta realizar la compra nuevamente.'
                    : 'Este pedido ha sido cancelado y ya no será procesado.'}
                </p>
              </div>
            ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-theme-element"></div>
              
              <div className="space-y-6 relative">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${order.status !== 'pending' ? 'bg-theme-primary text-white shadow-[0_0_15px_rgba(227,28,37,0.4)]' : 'bg-theme-element text-gray-500'}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                     <p className={`font-bold text-lg ${order.status !== 'pending' ? 'text-white' : 'text-gray-400'}`}>Pedido Recibido</p>
                     <p className="text-gray-500 text-sm">Tu pago ha sido procesado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${['preparing', 'shipped', 'delivered'].includes(order.status) ? 'bg-theme-primary text-white shadow-[0_0_15px_rgba(227,28,37,0.4)]' : 'bg-theme-base border-2 border-theme-border text-gray-500'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                     <p className={`font-bold text-lg ${['preparing', 'shipped', 'delivered'].includes(order.status) ? 'text-white' : 'text-gray-400'}`}>Preparando Pedido</p>
                     <p className="text-gray-500 text-sm">Estamos empacando tus repuestos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${['shipped', 'delivered'].includes(order.status) ? 'bg-theme-primary text-white shadow-[0_0_15px_rgba(227,28,37,0.4)]' : 'bg-theme-base border-2 border-theme-border text-gray-500'}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                     <p className={`font-bold text-lg ${['shipped', 'delivered'].includes(order.status) ? 'text-white' : 'text-gray-400'}`}>En Camino</p>
                     <p className="text-gray-500 text-sm">Entregado al vehículo de reparto</p>
                     {order.trackingNumber && ['shipped', 'delivered'].includes(order.status) && (
                        <div className="mt-3 text-sm text-gray-300 bg-theme-base p-4 rounded border border-theme-border inline-block shadow-inner">
                          <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Orden de Transporte (Chilexpress)</span>
                          <span className="font-mono text-white font-bold text-base tracking-widest">{order.trackingNumber}</span>
                          <button className="block mt-2 text-theme-primary hover:text-red-400 font-bold transition-colors flex items-center gap-1">
                            Rastrear paquete <ArrowLeft className="w-4 h-4 rotate-135" />
                          </button>
                        </div>
                     )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${order.status === 'delivered' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-theme-base border-2 border-theme-border text-gray-500'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                     <p className={`font-bold text-lg ${order.status === 'delivered' ? 'text-green-400' : 'text-gray-400'}`}>Entregado</p>
                     {order.status === 'delivered' && <p className="text-gray-400 text-sm">Disfruta tus repuestos</p>}
                  </div>
                </div>
              </div>
            </div>
            )}
          </section>

          <section className="bg-theme-card border border-theme-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Artículos del Pedido</h2>
            <div className="space-y-4 divide-y divide-[#1e293b]">
              {order.items.map((item: any) => (
                <div key={item.sku} className="pt-4 first:pt-0 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-400 font-mono mt-1">SKU: {item.sku} &middot; Cantidad: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">{formatCLP(item.price * item.qty)}</span>
                    {item.qty > 1 && <span className="text-xs text-gray-500">{formatCLP(item.price)} c/u</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-theme-card border border-theme-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Resumen Financiero</h2>
            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-theme-border">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({order.items.reduce((acc: number, item: any) => acc + item.qty, 0)} items)</span>
                <span className="font-medium text-white">{formatCLP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Costo de Envío</span>
                <span className="font-medium text-white">{formatCLP(order.shipping)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold text-white">
              <span>Total pagado</span>
              <span className="text-theme-primary">{formatCLP(order.total)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-theme-border">
              <span className="text-xs text-gray-500 block">Método de pago</span>
              <span className="text-sm text-gray-300 font-medium">Flow (Webpay Plus)</span>
            </div>
          </section>

          <section className="bg-theme-card border border-theme-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Dirección de Envío</h2>
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm leading-relaxed">{order.shippingAddress}</p>
            </div>
          </section>

          <section className="bg-theme-card border border-theme-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">¿Necesitas ayuda?</h2>
            <p className="text-sm text-gray-400 mb-4">Si tienes problemas con tu pedido, puedes contactar a nuestro soporte técnico para más información.</p>
            <button className="w-full bg-theme-element hover:bg-theme-primary text-white font-medium py-2 rounded transition-colors">
              Contactar Soporte
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
