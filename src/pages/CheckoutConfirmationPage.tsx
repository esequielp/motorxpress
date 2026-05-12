import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../store/cart';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CheckoutConfirmationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { clearCart } = useCart();

  useEffect(() => {
    // Usually we would verify the token with the backend here.
    // Assuming success for demo purposes, we clear the cart.
    if (token && !token.includes('error')) {
      clearCart();
    }
  }, [token, clearCart]);

  if (!token || token.includes('error')) {
     return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-20 h-20 text-[#E31C25] mb-6" />
        <h1 className="text-4xl font-bebas tracking-wide mb-4 text-white">ERROR EN EL PAGO</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Hubo un problema al procesar tu pago. Tu tarjeta no ha sido cargada. Por favor, intenta nuevamente.
        </p>
        <Link to="/checkout" className="bg-white text-black hover:bg-gray-200 transition-colors px-8 py-3 rounded font-bold">
          Volver al Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-4xl font-bebas tracking-wide mb-4 text-white">¡PAGO CONFIRMADO!</h1>
      <p className="text-xl font-mono text-gray-300 mb-6">Pedido <span className="text-white font-bold">#MX-{Math.floor(Math.random() * 100000).toString().padStart(5, '0')}</span></p>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Te enviaremos un correo electrónico cuando tu pedido sea despachado con la información de seguimiento.
      </p>
      
      <div className="flex gap-4">
        <button className="bg-[#1F1F24] text-white hover:bg-[#333] transition-colors border border-gray-700 px-6 py-3 rounded font-medium">
          Ver estado del pedido
        </button>
        <Link to="/" className="bg-[#E31C25] hover:bg-red-700 text-white transition-colors px-6 py-3 rounded font-bold">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
