import { Truck, Clock, MapPin } from 'lucide-react';

export default function ShippingTimePage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-gray-300">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white text-center">TIEMPOS DE ENVÍO</h1>
      <p className="text-center text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
        Entendemos que tener tu auto detenido es un problema. Por eso operamos de forma acelerada junto a nuestros partners logísticos diarios para entregar tu repuesto a la brevedad.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 text-center">
          <Truck className="w-10 h-10 text-[#E31C25] mx-auto mb-4" />
          <h3 className="font-bold text-white text-lg mb-2">Despacho Diario</h3>
          <p className="text-sm text-gray-400">Todo pedido pagado antes de las 14:00hrs se despacha a courier el mismo día hábil.</p>
        </div>
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 text-center">
          <Clock className="w-10 h-10 text-[#E31C25] mx-auto mb-4" />
          <h3 className="font-bold text-white text-lg mb-2">Tiempos Estimados</h3>
          <p className="text-sm text-gray-400">Región Metropolitana: 24 a 48 hrs hábiles. Regiones extremas: 3 a 5 días hábiles.</p>
        </div>
        <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 text-center">
          <MapPin className="w-10 h-10 text-[#E31C25] mx-auto mb-4" />
          <h3 className="font-bold text-white text-lg mb-2">Cobertura Total</h3>
          <p className="text-sm text-gray-400">Llegamos a todo Chile gracias a la red de cobertura nacional de Chilexpress.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0A0A0C] border border-[#1F1F24] p-6 rounded-lg">
           <h2 className="text-xl font-bold text-white mb-4">Preguntas de Logística</h2>
           <div className="space-y-4">
             <div>
               <h4 className="font-bold text-white text-sm mb-1">¿Cómo puedo hacer seguimiento de mi pedido?</h4>
               <p className="text-sm text-gray-400">Una vez que tu paquete es entregado a Chilexpress, recibirás un correo con el número de Orden de Transporte (OT). También podrás verlo directamente desde la pestaña "Mis Pedidos" en tu cuenta.</p>
             </div>
             <div>
               <h4 className="font-bold text-white text-sm mb-1">¿Cuáles son los costos de envío?</h4>
               <p className="text-sm text-gray-400">El costo depende del peso volumétrico de tus repuestos y la comuna de destino. El valor exacto se calcula y se muestra de forma transparente en el último paso antes del pago (checkout) al ingresar tu dirección.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
