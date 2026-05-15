import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "¿Qué pasa si compro un repuesto y no le sirve a mi auto?",
    answer: "Si el repuesto no es compatible, puedes devolverlo dentro de los primeros 30 días siempre y cuando esté sin uso y en su caja original. Te recomendamos usar nuestro chat de soporte antes de comprar si tienes dudas sobre compatibilidad proporcionando el VIN o la patente de tu auto."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Procesamos nuestros pagos de manera 100% segura mediante Flow. Aceptamos Tarjetas de Crédito, Tarjetas de Débito, RedCompra y Transferencias Bancarias."
  },
  {
    question: "¿Hacen envíos a regiones?",
    answer: "¡Sí! Despachamos a todo el territorio continental de Chile a través de Chilexpress. Al momento del checkout, podrás ver el costo y tiempo estimado según tu comuna."
  },
  {
    question: "¿Tienen tienda física donde pueda retirar?",
    answer: "Actualmente operamos bajo un modelo 100% online desde nuestro centro de distribución ubicado en Santiago, lo que nos permite mantener precios más competitivos. Todos los despachos son vía courier."
  },
  {
    question: "¿Tienen garantía los repuestos?",
    answer: "Todos nuestros repuestos cuentan con la garantía legal de 6 meses por fallas de fábrica. Esto no cubre daños por mala instalación o desgaste por uso normal. Recomendamos fuertemente realizar las instalaciones en talleres mecánicos establecidos."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-3xl">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white text-center">PREGUNTAS FRECUENTES</h1>
      <p className="text-center text-gray-400 mb-12 text-lg">Resolvemos tus principales dudas sobre disponibilidad, modalidades de pago y envíos.</p>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div 
            key={index} 
            className="bg-theme-card border border-theme-border rounded-lg overflow-hidden transition-colors hover:border-theme-border-hover"
          >
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-bold text-white pr-8">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-theme-primary flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {openIndex === index && (
              <div className="px-6 pb-5 pt-2 text-gray-400 text-sm leading-relaxed border-t border-theme-border mt-2 bg-theme-base/50">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400">¿No encontraste lo que buscabas?</p>
        <button className="mt-4 border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white px-8 py-3 rounded font-bold transition-colors">
          Contactar a Soporte
        </button>
      </div>
    </div>
  );
}
