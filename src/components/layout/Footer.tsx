import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-theme-base border-t border-theme-border py-12 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-theme-text-body text-sm">
        <div>
          <h3 className="text-theme-text-header font-bebas text-xl mb-4 tracking-wider">MOTOR<span className="text-theme-primary">[X]</span>PRESS</h3>
          <p>Los mejores repuestos automotrices con envío a todo Chile.</p>
        </div>
        <div>
          <h4 className="text-theme-text-header font-bold mb-4">Soporte</h4>
          <ul className="space-y-2">
            <li><Link to="/p/retornos" className="hover:text-theme-primary">Políticas de Devolución</Link></li>
            <li><Link to="/p/faq" className="hover:text-theme-primary">Preguntas Frecuentes</Link></li>
            <li><Link to="/p/envios" className="hover:text-theme-primary">Tiempos de Envío</Link></li>
            <li><Link to="/p/garantia" className="hover:text-theme-primary">Política de Garantía</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-theme-text-header font-bold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/p/quienes-somos" className="hover:text-theme-primary">Quiénes Somos</Link></li>
            <li><Link to="/p/terminos" className="hover:text-theme-primary">Términos y Condiciones</Link></li>
            <li><Link to="/p/privacidad" className="hover:text-theme-primary">Política de Privacidad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-theme-text-header font-bold mb-4">Pago Seguro</h4>
          <div className="flex gap-2 mb-2">
             <div className="bg-theme-card border border-theme-border p-2 rounded text-xs font-bold font-mono text-theme-text-header">FLOW</div>
             <div className="bg-theme-card border border-theme-border p-2 rounded text-xs font-bold font-mono text-theme-text-header">WEBPAY</div>
          </div>
          <p className="text-xs">Pagos procesados de forma segura vía Flow.</p>
        </div>
      </div>
    </footer>
  );
}
