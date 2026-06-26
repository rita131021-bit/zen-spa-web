import { useState, useEffect, useCallback } from "react";
import { Gift, Heart, Sparkles, Calendar } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";
import EditablePrice from "@/components/EditablePrice";
import { apiUrl } from "@/lib/api";

const CARDS = [
  { id: "gc-relax",   emoji: "🌸", title: "Gift Card Relax",   subtitle: "Sesión Spa Relax completa",  color: "#F5F0FF", accent: "#7C3AED", description: "El regalo ideal para quienes necesitan un momento de calma." },
  { id: "gc-armonia", emoji: "✨", title: "Gift Card Armonía", subtitle: "Spa + Terapia alternativa",   color: "#FEF9EE", accent: "#D97706", description: "Bienestar completo de cuerpo y energía para tu mascota amada.", featured: true },
  { id: "gc-libre",   emoji: "🎁", title: "Gift Card Libre",   subtitle: "A elección del dueño",       color: "#F0FDF4", accent: "#16A34A", description: "Elegí el monto y la mascota decide el servicio. Válida 6 meses." },
];

interface PriceEntry { id: string; price: string; priceNote: string; }

function GiftCard({ card, price, priceNote, onPriceSaved }: {
  card: typeof CARDS[0];
  price: string;
  priceNote: string;
  onPriceSaved: (id: string, p: string, n: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        background: card.color,
        border: (card as any).featured ? `2px solid ${card.accent}` : "1px solid #E8E3F4",
        boxShadow: hovered ? `0 12px 32px ${card.accent}22` : `0 2px 12px ${card.accent}11`,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {(card as any).featured && (
        <div style={{ position: "absolute", top: 0, right: 0, background: card.accent, color: "white", fontSize: 10, fontWeight: 800, padding: "5px 14px", borderRadius: "0 1.5rem 0 1rem", letterSpacing: 0.5 }}>
          Más regalado
        </div>
      )}

      <div style={{ position: "absolute", bottom: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: card.accent + "0d", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 20, right: 20, width: 60, height: 60, borderRadius: "50%", background: card.accent + "0a", pointerEvents: "none" }} />

      <div style={{ fontSize: 36, lineHeight: 1 }}>{card.emoji}</div>

      <div>
        <h3 style={{ fontWeight: 900, fontSize: "1.1rem", color: "#1F2937", marginBottom: 4 }}>{card.title}</h3>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: card.accent, marginBottom: 6 }}>{card.subtitle}</p>
        <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.55 }}>{card.description}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0", borderTop: "1px solid " + card.accent + "22" }}>
        <EditablePrice
          serviceId={card.id}
          price={price}
          priceNote={priceNote}
          featured={(card as any).featured}
          onSaved={(p, n) => onPriceSaved(card.id, p, n)}
        />
      </div>

      <button
        onClick={scrollToReservas}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: card.accent, color: "white",
          fontWeight: 700, fontSize: 13, padding: "11px 0",
          borderRadius: 14, border: "none", cursor: "pointer",
          boxShadow: `0 4px 14px ${card.accent}33`,
          transition: "opacity 0.15s",
          opacity: hovered ? 0.9 : 1,
        }}
      >
        <Gift size={14} /> Regalar ahora
      </button>
    </div>
  );
}

export default function GiftCardsSection() {
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

  const handlePriceSaved = useCallback((id: string, price: string, priceNote: string) => {
    setPrices(prev => ({ ...prev, [id]: { price, priceNote } }));
  }, []);

  return (
    <section id="gift-cards" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FEF3C7", borderRadius: 20, padding: "5px 16px", marginBottom: 14 }}>
            <Heart size={13} color="#D97706" fill="#D97706" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706", letterSpacing: "0.05em", textTransform: "uppercase" }}>Gift Cards</span>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "1.6rem", color: "#111827", marginBottom: 10 }}>
            Regalá bienestar y amor 🐾
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            El regalo más especial para una mascota querida. Podés enviarlo por WhatsApp o imprimirlo, ¡es válido por 6 meses!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {CARDS.map(card => (
            <GiftCard
              key={card.id}
              card={card}
              price={prices[card.id]?.price ?? ""}
              priceNote={prices[card.id]?.priceNote ?? ""}
              onPriceSaved={handlePriceSaved}
            />
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,#F5F0FF,#EDE9FE)", borderRadius: 20, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#4C1D95", marginBottom: 2 }}>¿Querés personalizar tu gift card?</p>
              <p style={{ fontSize: 12.5, color: "#6B7280" }}>Contactanos y armamos el paquete ideal para vos.</p>
            </div>
          </div>
          <button
            onClick={scrollToReservas}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#7C3AED", color: "white", fontWeight: 700, fontSize: 13, padding: "12px 22px", borderRadius: 14, border: "none", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}
          >
            <Calendar size={14} /> Consultar
          </button>
        </div>

      </div>
    </section>
  );
}
