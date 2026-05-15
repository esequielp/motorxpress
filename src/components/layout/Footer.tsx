import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-theme-base border-t border-theme-border py-12 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-400 text-sm">
        <div>
          <h3 className="text-white font-bebas text-xl mb-4 tracking-wider">MOTOR<span className="text-theme-primary">[X]</span>PRESS</h3>
          <p>Los mejores repuestos automotrices con envío a todo Chile.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Soporte</h4>
          <ul className="space-y-2">
            <li><Link to="/retornos" className="hover:text-white">Políticas de Devolución</Link></li>
            <li><Link to="/faq" className="hover:text-white">Preguntas Frecuentes</Link></li>
            <li><Link to="/envios" className="hover:text-white">Tiempos de Envío</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/terminos" className="hover:text-white">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad" className="hover:text-white">Política de Privacidad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Pago Seguro</h4>
          <div className="flex gap-2 mb-2">
             <div className="bg-theme-card p-2 rounded text-xs font-bold font-mono">FLOW</div>
             <div className="bg-theme-card p-2 rounded text-xs font-bold font-mono">WEBPAY</div>
          </div>
          <p className="text-xs">Pagos procesados de forma segura vía Flow.</p>
        </div>
      </div>
    </footer>
  );
}
