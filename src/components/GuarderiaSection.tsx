import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";
import EditablePrice from "@/components/EditablePrice";
import { apiUrl } from "@/lib/api";

function PawIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}

interface PriceEntry { id: string; price: string; priceNote: string; }

function GuarderiaCard({ image, title, subtitle, items, buttonLabel, priceId, price, priceNote, onPriceSaved }: {
  image: string; title: string; subtitle: string; items: string[];
  buttonLabel: string; priceId: string; price: string; priceNote: string;
  onPriceSaved: (id: string, p: string, n: string) => void;
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-row h-full">
      <div className="flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ width: "44%", background: "#f5f0ff", padding: "14px 10px" }}>
        <img src={image} alt={title} className="w-full h-full object-contain" style={{ maxHeight: 240 }} />
      </div>
      <div className="flex flex-col justify-between p-4 flex-1 min-h-0">
        <div>
          <h3 className="font-extrabold text-[13px] mb-1 leading-tight" style={{ color: "#7C3AED" }}>{title}</h3>
          <p className="text-gray-500 text-[11px] mb-2 leading-snug">{subtitle}</p>
          <div style={{ marginBottom: 8 }}>
            <EditablePrice
              serviceId={priceId}
              price={price}
              priceNote={priceNote}
              onSaved={(p, n) => onPriceSaved(priceId, p, n)}
            />
          </div>
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-700 leading-snug">
                <PawIcon className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" style={{ color: "#7C3AED" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="mt-3 w-full flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl text-[11.5px] text-white transition-all hover:bg-purple-800 active:scale-[0.98]"
          style={{ backgroundColor: "#7C3AED" }}
          onClick={scrollToReservas}
        >
          <Calendar size={11} /> {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function PeluqueriaCard({ image, title, items, priceId, price, priceNote, onPriceSaved }: {
  image: string; title: string; items: string[];
  priceId: string; price: string; priceNote: string;
  onPriceSaved: (id: string, p: string, n: string) => void;
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ height: 190, background: "#f5f0ff", padding: "14px 16px" }}>
        <img src={image} alt={title} className="w-full h-full object-contain" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-extrabold text-[13px] mb-2 leading-tight" style={{ color: "#7C3AED" }}>{title}</h3>
        <div style={{ marginBottom: 8 }}>
          <EditablePrice
            serviceId={priceId}
            price={price}
            priceNote={priceNote}
            onSaved={(p, n) => onPriceSaved(priceId, p, n)}
          />
        </div>
        <ul className="space-y-1.5 flex-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-gray-700 leading-snug">
              <PawIcon className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" style={{ color: "#7C3AED" }} />
              {item}
            </li>
          ))}
        </ul>
        <button
          className="mt-4 w-full flex items-center justify-center gap-1.5 font-bold py-2.5 rounded-xl text-[11.5px] text-white transition-all hover:bg-purple-800 active:scale-[0.98]"
          style={{ backgroundColor: "#7C3AED" }}
          onClick={scrollToReservas}
        >
          <Calendar size={11} /> Reservar
        </button>
      </div>
    </div>
  );
}

export default function GuarderiaSection() {
  const [prices, setPrices] = useState<Record<string, { price: string; priceNote: string }>>({});

  useEffect(() => {
    fetch(apiUrl("/api/prices"))
      .then(r => r.ok ? r.json() : [])
      .then((data: PriceEntry[]) => {
        const map: Record<string, { price: string; priceNote: string }> = {};
        for (const p of data) map[p.id] = { price: p.price, priceNote: p.priceNote };
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  const handleSaved = useCallback((id: string, price: string, priceNote: string) => {
    setPrices(prev => ({ ...prev, [id]: { price, priceNote } }));
  }, []);

  const gp = (id: string) => prices[id] ?? { price: "", priceNote: "por día" };

  return (
    <section id="guarderia" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">

          <GuarderiaCard
            image="/assets/guarderia-canina-photo.png"
            title="Guardería para Perros"
            subtitle="Diversión, cuidado y amor todo el día."
            priceId="gua-canina"
            price={gp("gua-canina").price}
            priceNote={gp("gua-canina").priceNote}
            onPriceSaved={handleSaved}
            items={["Libre de estrés, como en casa","Juegos adaptados a su tamaño y edad","Con pelotones en época de calor","Caminatas y salidas para su bienestar","Salas climatizadas","Cuidados las 24 horas (equipo de 4 personas)","Rutinas higiénicas y mantenimiento"]}
            buttonLabel="Reservar guardería"
          />

          <GuarderiaCard
            image="/assets/guarderia-felina-photo.png"
            title="Guardería Felina"
            subtitle="Entorno tranquilo y seguro para tu gato."
            priceId="gua-felina"
            price={gp("gua-felina").price}
            priceNote={gp("gua-felina").priceNote}
            onPriceSaved={handleSaved}
            items={["Ambientes separados y silenciosos","Juegos y enriquecimiento ambiental","Alimentación según sus hábitos","Cuidados las 24 horas (equipo especializado)","Rutinas de higiene y limpieza diaria"]}
            buttonLabel="Reservar guardería"
          />

          <PeluqueriaCard
            image="/assets/peluqueria-canina-photo.png"
            title="Peluquería Canina"
            priceId="pel-canina"
            price={gp("pel-canina").price}
            priceNote={gp("pel-canina").priceNote}
            onPriceSaved={handleSaved}
            items={["Corte de uñas","Cepillado y retiro de nudos","Deslanado","Baño y masajes","Secado con toalla y calor suave","Limpieza del conducto auditivo y lagrimal","Aromatización energética","Cortes (de ser necesario)"]}
          />

          <PeluqueriaCard
            image="/assets/peluqueria-felina-photo.png"
            title="Peluquería Felina"
            priceId="pel-felina"
            price={gp("pel-felina").price}
            priceNote={gp("pel-felina").priceNote}
            onPriceSaved={handleSaved}
            items={["Corte de uñas","Cepillado y retiro de nudos","Deslanado","Baño y masajes suaves","Secado con toalla y calor controlado","Limpieza del conducto auditivo y lagrimal","Aromatización relajante"]}
          />

        </div>
      </div>
    </section>
  );
}
