export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-gray-300 space-y-6">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white">POLÍTICA DE PRIVACIDAD</h1>
      
      <p className="text-sm text-gray-400 font-mono">Vigente a partir de: Noviembre 2024</p>
      
      <div className="bg-[#18181C] border-l-4 border-[#E31C25] p-6 my-8 rounded-r-lg">
        <p className="text-white text-lg">
          En MotorXpress, la seguridad de tu información y tus datos técnicos de vehículos son sagrados. Nos tomamos sumamente en serio la confidencialidad de tus datos.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Datos que Recolectamos</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Cuando te registras o haces una compra como invitado recolectamos tu información básica requerida legalmente y para aspectos logísticos: nombre, apellidos, dirección de envío, RUN/RUT, número de teléfono y correo electrónico. Además, podemos guardar el Historial de Patentes / VINs consultados opcionalmente para presentarte repuestos pre-filtrados en un futuro.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Uso de la Información</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Utilizamos tus datos de contacto estrictamente para: (A) Procesar y despachar tus órdenes. (B) Proveer el seguimiento de Chilexpress, (C) Entregar servicio de atención al cliente vía chat y correo y (D) Emisión de la boleta o factura frente al Servicio de Impuestos Internos de Chile (SII).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Procesamiento de Pagos Seguro</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            MotorXpress <strong>NUNCA</strong> recolecta, lee, procesa ni almacena directamente tarjetas de crédito, coordenadas bancarias o credenciales bancarias. Toda transacción es procesada por un actor externo de nivel adquirente y pasarela regulado por la CMF, en este caso <strong>Flow S.A</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Derechos del Usuario (Ley 19.628)</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            En consistencia a la Ley Chilena sobre Protección de Datos de Carácter Personal, posees el derecho de solicitar en todo momento la modificación, rectificación o eliminación total de tu cuenta de usuario e historial personal asociado a tus correos de nuestra base de datos relacional (Supabase PostgreSQL) escribiendo un ticket a la zona de soporte.
          </p>
        </section>
      </div>
    </div>
  );
}
