export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-gray-300 space-y-6">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white">POLÍTICAS DE DEVOLUCIÓN</h1>
      
      <p className="text-lg">
        En MotorXpress, nos comprometemos con tu completa satisfacción. Si no estás conforme con tu compra o te equivocaste de repuesto, ofrecemos una garantía de devolución de 30 días bajo las siguientes condiciones.
      </p>

      <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">1. Condiciones Generales</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
          <li>El artículo debe estar 100% nuevo, sin uso y en su embalaje original intacto.</li>
          <li>No se aceptan devoluciones de partes eléctricas ni repuestos que evidencien haber sido instalados o probados.</li>
          <li>Debes presentar la boleta, factura o comprobante de compra digital.</li>
          <li>Los fluidos (aceites, refrigerantes) cuyo sello de garantía haya sido roto no aplican para devolución.</li>
        </ul>
      </div>

      <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">2. Proceso de Devolución</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Para iniciar una devolución, por favor contacta a nuestro equipo de soporte utilizando el chat integrado o escribiendo a <span className="font-mono text-white">soporte@motorxpress.cl</span> con tu número de pedido (#MX-XXXX) y el motivo de la devolución.
          Te enviaremos una etiqueta validada para que puedas entregar el artículo en la sucursal de Chilexpress más cercana.
        </p>
      </div>

      <div className="bg-[#18181C] border border-[#1F1F24] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">3. Reembolsos</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Una vez recibido e inspeccionado el producto por nuestros mecánicos, te notificaremos la resolución. Si cumple las condiciones, el reembolso se procesará automáticamente al método de pago original (Tarjeta de Crédito, Débito vía Flow) en un plazo aproximado de 5 a 10 días hábiles, dependiendo de la entidad bancaria.
        </p>
      </div>
    </div>
  );
}
