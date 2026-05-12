import { useState } from 'react';
import { useCart } from '../store/cart';
import { formatCLP } from '../lib/utils/formatCLP';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [shippingOption, setShippingOption] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingData, setShippingData] = useState<any>(null);
  
  const subtotal = total();
  const shippingCost = shippingOption ? shippingOption.totalPrice : 0;
  const finalTotal = subtotal + shippingCost;

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[50vh]">
        <h1 className="text-3xl font-bebas mb-4">CARRITO VACÍO</h1>
        <p className="text-gray-400 mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <button onClick={() => navigate('/catalogo')} className="bg-[#E31C25] text-white px-8 py-3 rounded font-bold">
          Ir al catálogo
        </button>
      </div>
    );
  }

  const handleShippingSubmit = async (data: any) => {
    setShippingData(data);
    setStep(2);
    setIsLoadingRates(true);
    
    try {
      const res = await fetch(`/api/chilexpress/quote?commune=${encodeURIComponent(data.commune)}&weight=1.5`);
      const options = await res.json();
      setShippingOptions(options);
      if (options.length > 0) {
        setShippingOption(options[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Simulate order creation and getting flow redirect url
      const res = await fetch('/api/flow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: `MX-${Date.now()}`,
          shippingData,
          shippingOption,
          items,
          total: finalTotal
        })
      });
      const data = await res.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error(err);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bebas mb-8">CHECKOUT</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {step === 1 ? (
            <CheckoutForm onComplete={handleShippingSubmit} />
          ) : (
             <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">2. Opciones de Envío</h2>
                  <button onClick={() => setStep(1)} className="text-[#E31C25] text-sm hover:underline">
                    Editar Datos
                  </button>
                </div>
                
                {isLoadingRates ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-[#1F1F24] rounded"></div>
                    <div className="h-20 bg-[#1F1F24] rounded"></div>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-4">
                    {shippingOptions.map((opt: any) => (
                      <label 
                        key={opt.serviceType}
                        className={`flex justify-between items-center p-4 border rounded cursor-pointer transition-colors ${
                          shippingOption?.serviceType === opt.serviceType 
                            ? 'border-[#E31C25] bg-[#E31C25]/10' 
                            : 'border-[#1F1F24] hover:bg-[#1F1F24]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingOption?.serviceType === opt.serviceType}
                            onChange={() => setShippingOption(opt)}
                            className="accent-[#E31C25] w-5 h-5"
                          />
                          <div>
                            <p className="font-bold text-white">{opt.serviceDescription}</p>
                            <p className="text-sm text-gray-400">{opt.deliveryTime}</p>
                          </div>
                        </div>
                        <span className="font-bold text-white">{formatCLP(opt.totalPrice)}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 p-4 bg-[#1F1F24] rounded text-center">
                    No pudimos obtener tarifas. Usaremos un costo base de {formatCLP(5990)}.
                    <button 
                      onClick={() => setShippingOption({ serviceDescription: 'Envío Base', totalPrice: 5990, serviceType: 'BASE' })}
                      className="block mt-4 w-full bg-white text-black py-2 rounded"
                    >
                      Aceptar Tarifa Base
                    </button>
                  </div>
                )}
             </div>
          )}
        </div>

        <div>
          <div className="bg-[#18181C] p-6 rounded-lg border border-[#1F1F24] sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.sku} className="flex justify-between text-sm">
                  <div className="flex-1 pr-4">
                    <p className="text-gray-300 line-clamp-1">{item.name}</p>
                    <p className="text-gray-500">x{item.quantity}</p>
                  </div>
                  <span className="text-white whitespace-nowrap">{formatCLP(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t border-[#1F1F24] pt-4 mb-4 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Envío {shippingOption ? `(${shippingOption.serviceDescription.split(' ')[1] || ''})` : ''}</span>
                <span>{shippingOption ? formatCLP(shippingCost) : 'Por calcular'}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-white border-t border-[#1F1F24] pt-4 mb-6">
              <span>TOTAL</span>
              <span className="text-[#E31C25]">{formatCLP(finalTotal)}</span>
            </div>

            <button 
              disabled={step === 1 || !shippingOption || isProcessingPayment}
              onClick={handlePayment}
              className="w-full bg-[#E31C25] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-md transition-colors flex justify-center items-center gap-2"
            >
              {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : '🔒 PAGAR CON FLOW'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Acepta: débito, crédito, transferencia, RedCompra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
