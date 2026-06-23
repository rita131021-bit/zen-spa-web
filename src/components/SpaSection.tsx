import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";
import EditablePrice from "@/components/EditablePrice";

function CheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="7" cy="7" r="7" fill="#EDE9FE" />
      <path d="M4.5 7L6.2 8.8L9.5 5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SPA_SESSIONS = [
  {
    id: "spa-relax",
    image: "/assets/spa-relax-final.png",
    title: "Relax",
    subtitle: "Relajación y frescura para renovar energía",
    featured: false,
    features: [
      "Baño natural relajante",
      "Cepillado profundo",
      "Secado y brushing",
      "Corte de uñas",
      "Despeje y humectación de huellas",
      "Limpieza de oídos",
    ],
  },
  {
    id: "spa-armonia",
    image: "/assets/spa-armonia-final.png",
    title: "Armonía",
    subtitle: "Bienestar y equilibrio para cuerpo y mente",
    featured: false,
    features: [
      "Baño con cosmética de belleza adecuada",
      "Corte de pelo y deslanado",
      "Masaje relajante (masoterapia)",
      "Aromaterapia",
      "Limpieza de oídos",
      "Corte de uñas",
      "Despeje y humectación de huellas",
    ],
  },
  {
    id: "spa-premium",
    image: "/assets/spa-premium-final.png",
    title: "Premium",
    subtitle: "El spa más completo para renovación total",
    featured: true,
    features: [
      "Baño Spa Premium",
      "Estética completa",
      "Masaje terapéutico (masoterapia)",
      "Reiki para mascotas",
      "Péndulo",
      "Aromaterapia",
      "Limpieza de oídos",
      "Corte de uñas",
      "Despeje y humectación de huellas",
    ],
  },
];

interface PriceEntry { id: string; price: string; priceNote: string; visible: boolean; }

function SpaCard({ session, price, priceNote, onPriceSaved }: {
  session: typeof SPA_SESSIONS[0];
  price: string;
  priceNote: string;
  onPriceSaved: (id: string, p: string, n: string) => void;
}) {
  const [btnHovered, setBtnHovered] = useState(false);
  return (
    <div
      style={{
        background: "white",
        borderRadius: 24,
        border: session.featured ? "2px solid #F59E0B" : "1px solid #E8E3F4",
        boxShadow: session.featured ? "0 4px 28px rgba(245,158,11,0.13)" : "0 2px 12px rgba(124,58,237,0.07)",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = session.featured ? "0 8px 32px rgba(245,158,11,0.22)" : "0 8px 28px rgba(124,58,237,0.14)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = session.featured ? "0 4px 28px rgba(245,158,11,0.13)" : "0 2px 12px rgba(124,58,237,0.07)"; }}
    >
      {session.featured && (
        <div style={{ position: "absolute", top: 0, right: 0, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontSize: 10, fontWeight: 800, padding: "5px 14px", borderRadius: "0 1.5rem 0 1rem", letterSpacing: 0.5, zIndex: 10, boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}>
          Más Elegida
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", paddingTop: 28, paddingBottom: 10 }}>
        <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", border: "4px solid #EDE9FE", boxShadow: "0 4px 18px rgba(124,58,237,0.18)", background: "#faf8ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={session.image} alt={session.title} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center" }} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "0 20px 8px" }}>
        <p style={{ color: "#B0A8C8", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Sesión</p>
        <h3 style={{ color: "#6D28D9", fontWeight: 900, fontSize: "1.45rem", lineHeight: 1.1, marginBottom: 5, letterSpacing: "-0.01em" }}>{session.title}</h3>
        <p style={{ color: "#6B7280", fontSize: 12.5, lineHeight: 1.5, margin: 0, fontWeight: 400 }}>{session.subtitle}</p>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <EditablePrice
            serviceId={session.id}
            price={price}
            priceNote={priceNote}
            featured={session.featured}
            onSaved={(p, n) => onPriceSaved(session.id, p, n)}
          />
        </div>
      </div>

      <div style={{ margin: "10px 20px 12px", borderTop: "1px solid #F3F0FA" }} />

      <div style={{ padding: "0 20px 8px", flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {session.features.map((feat) => (
            <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <CheckCircle />
              <span style={{ color: "#2D2D3A", fontSize: 13, lineHeight: 1.45, fontWeight: 500 }}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: "14px 20px 22px" }}>
        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={scrollToReservas}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: btnHovered ? "#6D28D9" : "#7C3AED", color: "white", fontWeight: 700, fontSize: 13, padding: "11px 0", borderRadius: 14, border: "none", cursor: "pointer", transform: btnHovered ? "translateY(-2px)" : "translateY(0)", boxShadow: btnHovered ? "0 8px 24px rgba(124,58,237,0.42)" : "0 3px 10px rgba(124,58,237,0.25)", transition: "all 0.15s ease", letterSpacing: "0.01em" }}
        >
          <Calendar size={14} /> Reservar sesión
        </button>
      </div>
    </div>
  );
}

export default function SpaSection() {
  const [prices, setPrices] = useState<Record<string, { price: string; priceNote: string }>>({});

  useEffect(() => {
    fetch("/api/prices")
      .then(r => r.ok ? r.json() : [])
      .then((data: PriceEntry[]) => {
        const map: Record<string, { price: string; priceNote: string }> = {};
        for (const p of data) map[p.id] = { price: p.price, priceNote: p.priceNote };
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  const handlePriceSaved = useCallback((id: string, price: string, priceNote: string) => {
    setPrices(prev => ({ ...prev, [id]: { price, priceNote } }));
  }, []);

  return (
    <section id="spa" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#111827", textAlign: "center", marginBottom: 40 }}>
          Sesiones de Spa para Perros y Gatos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {SPA_SESSIONS.map((session) => (
            <SpaCard
              key={session.id}
              session={session}
              price={prices[session.id]?.price ?? ""}
              priceNote={prices[session.id]?.priceNote ?? "por sesión"}
              onPriceSaved={handlePriceSaved}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
