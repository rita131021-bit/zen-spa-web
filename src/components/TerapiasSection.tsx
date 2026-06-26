import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";
import EditablePrice from "@/components/EditablePrice";
import { apiUrl } from "@/lib/api";

function PawIcon({ size = 20, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}

function PersonIcon({ size = 20, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

interface PriceEntry { id: string; price: string; priceNote: string; }

const HOLISTICAS = ["Aromaterapia", "Reiki", "Péndulo para chacras", "Elíxires"];

export default function TerapiasSection() {
  const [btnHovered, setBtnHovered] = useState(false);
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

  const ter = prices["ter-completo"] ?? { price: "", priceNote: "por sesión" };

  return (
    <section id="terapias" className="py-12" style={{ backgroundColor: "#faf9ff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 style={{ textAlign: "center", fontWeight: 800, fontSize: "1.4rem", color: "#111827", marginBottom: 28 }}>
          Terapias Alternativas para tu Mascota
        </h2>

        <div
          style={{ borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "row", boxShadow: "0 2px 20px rgba(124,58,237,0.08)", minHeight: 207, border: "1px solid #EDE9FE" }}
          className="flex-col md:flex-row"
        >
          {/* Columna izquierda: lista de terapias */}
          <div style={{ flex: 1, background: "white", padding: "26px 24px", minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
              <div style={{ marginTop: 1 }}><PawIcon size={22} color="#7C3AED" /></div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 8 }}>Terapias Holísticas</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {HOLISTICAS.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#4B5563" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", flexShrink: 0, display: "inline-block" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ marginTop: 1 }}><PersonIcon size={22} color="#7C3AED" /></div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 6 }}>Flores de Bach</h3>
                <p style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.55, maxWidth: 210, margin: 0 }}>
                  Esencias naturales que ayudan a tratar y corregir diferentes patrones mentales y emocionales.
                </p>
              </div>
            </div>
          </div>

          {/* Columna central: imagen */}
          <div style={{ width: 288, flexShrink: 0, minHeight: 207, position: "relative", overflow: "hidden" }}>
            <img src="/assets/terapia-alternativa-card.png?v=2" alt="Perro relajado en spa" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, background: "linear-gradient(to bottom, white 50%, transparent 100%)", zIndex: 5 }} />
          </div>

          {/* Columna derecha: precio del servicio completo + CTA */}
          <div style={{ flex: 1, background: "white", padding: "26px 24px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 200, borderLeft: "1px solid #EDE9FE" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "#F5F0FF", marginBottom: 14 }}>
              <PawIcon size={20} color="#7C3AED" />
            </div>
            <h3 style={{ color: "#4C1D95", fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.3, marginBottom: 8 }}>
              Descubrí el poder del bienestar natural.
            </h3>
            <p style={{ color: "#9CA3AF", fontSize: 12.5, lineHeight: 1.55, marginBottom: 14 }}>
              Terapias que complementan, respetan y regeneran.
            </p>

            {/* Precio único del servicio */}
            <div style={{ marginBottom: 18 }}>
              <EditablePrice
                serviceId="ter-completo"
                price={ter.price}
                priceNote={ter.priceNote}
                onSaved={(p, n) => handleSaved("ter-completo", p, n)}
              />
            </div>

            <button
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              onClick={scrollToReservas}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: btnHovered ? "#6D28D9" : "#7C3AED", color: "white", fontWeight: 700, fontSize: 13, padding: "11px 22px", borderRadius: 14, border: "none", cursor: "pointer", alignSelf: "flex-start", transform: btnHovered ? "translateY(-2px)" : "translateY(0)", boxShadow: btnHovered ? "0 8px 24px rgba(124,58,237,0.38)" : "0 3px 12px rgba(124,58,237,0.18)", transition: "all 0.15s ease" }}
            >
              <Calendar size={14} /> Reservar terapia
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
