export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-gray-300 space-y-6">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white">TÉRMINOS Y CONDICIONES</h1>
      
      <p className="text-sm text-gray-400 font-mono">Última actualización: Noviembre 2024</p>
      <p className="text-base leading-relaxed">
        Bienvenido a MotorXpress. Los siguientes Términos y Condiciones rigen el uso del sitio web <span className="font-mono text-white">motorxpress.cl</span> y la compra de productos a través del mismo. Al navegar y realizar transacciones en esta plataforma, aceptas íntegramente las políticas detalladas a continuación.
      </p>

      <div className="space-y-6 mt-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">1. Ámbito de Aplicación</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Estos Términos aplican para todos los contratos y adquisiciones realizadas por consumidores en Chile (B2C) a través del e-commerce de MotorXpress. Los presentes términos se rigen según lo dispuesto en la Ley Nº 19.496 sobre Protección de los Derechos de los Consumidores en Chile.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">2. Catálogo de Repuestos y Disponibilidad</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Los repuestos, kits, lubricantes y piezas ofecidos en nuestro catálogo están sujetos a disponibilidad de inventario. Trabajamos arduamente por mantener nuestro stock sincronizado, pero en casos excepcionales por fallas de sincronismo de bases de datos, si un producto pagado careciera de stock, se realizará la devolución automática e íntegra del dinero en un plazo no superior a 3 días hábiles y se notificará al usuario de inmediato.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">3. Errores de Catálogo o Tipográficos</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Aunque nos esmeramos en proporcionar descripciones, compatibilidades (Listas de vehículos y años compatibles) y precios de alta precisión, nos reservamos el derecho de corregir cualquier error tipográfico, exactitud de aplicación o precio mal ingresado, y de cancelar pedidos amparados bajo un precio manifiestamente incorrecto (error por precio irrisorio).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">4. Propiedad Intelectual</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Todo el contenido alojado en el sitio, incluyendo pero no limitado a logos, diseños, textos, gráficos e infraestructura de software es propiedad de MotorXpress. Su reproducción sin consentimiento previo y expreso está estrictamente prohibida.
          </p>
        </section>
      </div>
    </div>
  );
}
