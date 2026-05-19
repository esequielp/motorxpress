import { useState, useEffect } from 'react';
import { useCart } from '../store/cart';
import { formatCLP } from '../lib/utils/formatCLP';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, addItem } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [shippingOption, setShippingOption] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingData, setShippingData] = useState<any>(null);
  const [checkoutCrossSells, setCheckoutCrossSells] = useState<any[]>([]);
  
  const subtotal = total();
  const shippingCost = shippingOption ? shippingOption.totalPrice : 0;
  const finalTotal = subtotal + shippingCost;

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(allProducts => {
         if(Array.isArray(allProducts)){
            const allTerms = new Set<string>();
            items.forEach(cartItem => {
               const fullProduct = allProducts.find(p => String(p.id) === String(cartItem.id));
               if(fullProduct && fullProduct.cross_sell_ids) {
                  const terms = fullProduct.cross_sell_ids.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
                  terms.forEach((t: string) => allTerms.add(t));
               }
            });
            
            let crossSells: any[] = [];
            if(allTerms.size > 0) {
                crossSells = allProducts.filter(p => (allTerms.has(p.sku?.toLowerCase()) || allTerms.has(p.mpn?.toLowerCase())) && !items.find((i: any) => String(i.id) === String(p.id)));
            }
            
            // Fallback to random popular/available products if cross sells list is empty
            if (crossSells.length === 0) {
                crossSells = allProducts.filter(p => !items.find((i: any) => String(i.id) === String(p.id)));
            }
            
            setCheckoutCrossSells(crossSells.slice(0, 2));
         }
      })
      .catch(console.error);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[50vh]">
        <h1 className="text-3xl font-bebas mb-4">CARRITO VACÍO</h1>
        <p className="text-gray-400 mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <button onClick={() => navigate('/catalogo')} className="bg-theme-primary text-white px-8 py-3 rounded font-bold">
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
      // Simulate order creation in db
      const savedUserStr = localStorage.getItem('motorxpress_user');
      let user = savedUserStr ? JSON.parse(savedUserStr) : null;
      
      // Save address if requested and user is logged in
      if (user && shippingData.saveAddress) {
        const currentAddresses = user.addresses ? JSON.parse(user.addresses) : [];
        const newAddress = {
          id: Date.now().toString(),
          label: shippingData.saveAddressLabel || 'Nueva Dirección',
          street: shippingData.street,
          number: shippingData.number,
          commune: shippingData.commune,
          region: shippingData.region
        };
        const updatedAddresses = [...currentAddresses, newAddress];
        try {
          const uRes = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ...user,
              addresses: JSON.stringify(updatedAddresses)
            })
          });
          if (uRes.ok) {
            user = { ...user, addresses: JSON.stringify(updatedAddresses) };
            localStorage.setItem('motorxpress_user', JSON.stringify(user));
          }
        } catch (e) {
          console.error("Failed to save user address", e);
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user ? user.id : null,
          customer_name: `${shippingData.firstName} ${shippingData.lastName}`,
          customer_email: shippingData.email,
          customer_phone: shippingData.phone,
          shipping_address: `${shippingData.street} ${shippingData.number}${shippingData.apartment ? ` Dpto ${shippingData.apartment}` : ''}, ${shippingData.commune}, ${shippingData.region}`,
          items,
          total: finalTotal
        })
      });
      const data = await res.json();
      
      if (data.orderId) {
        // We do a mock flow page or just go to confirmation directly since real Flow needs API keys
        navigate(`/checkout/confirmacion?token=success&orderId=${data.orderId}`, { state: { orderId: data.orderId, isSuccess: true } });
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
            <CheckoutForm onComplete={handleShippingSubmit} initialData={shippingData} />
          ) : (
             <div className="bg-theme-card p-6 rounded-lg border border-theme-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">2. Opciones de Envío</h2>
                  <button onClick={() => setStep(1)} className="text-theme-primary text-sm hover:underline">
                    Editar Datos
                  </button>
                </div>
                
                {isLoadingRates ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-theme-element rounded"></div>
                    <div className="h-20 bg-theme-element rounded"></div>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-4">
                    {shippingOptions.map((opt: any) => (
                      <label 
                        key={opt.serviceType}
                        className={`flex justify-between items-center p-4 border rounded cursor-pointer transition-colors ${
                          shippingOption?.serviceType === opt.serviceType 
                            ? 'border-theme-primary bg-theme-primary/10' 
                            : 'border-theme-border hover:bg-theme-element'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingOption?.serviceType === opt.serviceType}
                            onChange={() => setShippingOption(opt)}
                            className="accent-theme-primary w-5 h-5"
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
                  <div className="text-gray-400 p-4 bg-theme-element rounded text-center">
                    No pudimos obtener tarifas. Usaremos un costo base de {formatCLP(5990)}.
                    <button 
                      onClick={() => setShippingOption({ serviceDescription: 'Envío Base', totalPrice: 5990, serviceType: 'BASE' })}
                      className="block mt-4 w-full bg-white text-black py-2 rounded"
                    >
                      Aceptar Tarifa Base
                    </button>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-theme-border text-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-theme-primary hover:underline transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
                    disabled={isProcessingPayment}
                  >
                    Volver a Datos de Envío
                  </button>
                </div>
             </div>
          )}

          {checkoutCrossSells.length > 0 && (
            <div className="mt-8 pt-8 border-t border-theme-border">
              <h3 className="font-bold text-xl mb-4 text-theme-primary flex items-center gap-2">
                <span className="text-2xl">🔥</span> Ofertas exclusivas para tu pedido
              </h3>
              <p className="text-gray-400 mb-6 text-sm">Aprovecha y agrega estos productos recomendados antes de finalizar tu compra.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {checkoutCrossSells.map(product => (
                  <div key={product.id} className="flex gap-4 p-4 border border-theme-border rounded-lg bg-theme-card group hover:border-theme-primary transition-colors items-center">
                    <img src={product.image.split(',')[0]} alt={product.name} className="w-20 h-20 object-cover rounded bg-theme-base" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white line-clamp-2 leading-tight mb-2">{product.name}</p>
                      <p className="text-theme-primary font-bold">{formatCLP(product.is_offer ? product.offer_price : product.price)}</p>
                    </div>
                    <button 
                      onClick={() => addItem(product)}
                      className="flex-shrink-0 bg-theme-element hover:bg-theme-primary hover:text-white text-gray-400 p-3 rounded-md transition-colors"
                      title="Agregar al carrito"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-theme-card p-6 rounded-lg border border-theme-border sticky top-24">
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
            
            <div className="space-y-2 border-t border-theme-border pt-4 mb-4 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Envío {shippingOption ? `(${shippingOption.serviceDescription.split(' ')[1] || ''})` : ''}</span>
                <span>{shippingOption ? formatCLP(shippingCost) : 'Por calcular'}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-white border-t border-theme-border pt-4 mb-6">
              <span>TOTAL</span>
              <span className="text-theme-primary">{formatCLP(finalTotal)}</span>
            </div>

            <button 
              disabled={step === 1 || !shippingOption || isProcessingPayment}
              onClick={handlePayment}
              className="w-full bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-md transition-colors flex justify-center items-center gap-2"
            >
              {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : '🔒 PAGAR CON FLOW'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 mb-4">
              Acepta: débito, crédito, transferencia, RedCompra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
