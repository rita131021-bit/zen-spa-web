function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" className="text-purple-600" />
      <path d="M8 12l3 3 5-5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const requisitos = [
  "Libreta sanitaria con vacunas al día",
  "Desparasitación al día",
  "Castración (obligatoria)",
  "Sociabilidad",
  "Perros mayores de 15 años deben presentar certificado de salud",
];

export default function RequisitosSection() {
  return (
    <section className="py-10 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-7">
          <h2 className="text-base font-extrabold text-gray-900 mb-5">
            Requisitos para todos los servicios (OBLIGATORIOS)
          </h2>
          <div className="flex flex-wrap gap-5 lg:gap-8">
            {requisitos.map((req, i) => (
              <div key={i} className="flex items-center gap-2 min-w-[180px]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-purple-600" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#7C3AED" />
                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-700 font-medium">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
