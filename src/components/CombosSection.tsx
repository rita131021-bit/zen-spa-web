import { useState, useEffect, useRef } from "react";
import { Calendar, Sparkles, Star, ImageOff } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";
import { useAdmin } from "@/context/AdminContext";
import { apiUrl } from "@/lib/api";

interface Combo {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  priceNote: string;
  badge: string;
  highlight: boolean;
  active: boolean;
  services: string[];
  imageUrl: string;
}

const FALLBACK_COMBOS: Combo[] = [
  {
    id: "com-relax-pel",
    name: "Relax + Peluquería",
    description: "El cuidado esencial completo en una sola visita.",
    price: "$14.000",
    originalPrice: "$15.500",
    discount: "10%",
    priceNote: "por sesión",
    badge: "🐾 Canino & Felino",
    highlight: false,
    active: true,
    imageUrl: "/assets/combos/relax-peluqueria.png",
    services: ["Baño natural relajante", "Corte y cepillado completo", "Corte de uñas", "Limpieza de oídos", "Aromatización final"],
  },
  {
    id: "com-armonia",
    name: "Armonía + Terapia",
    description: "Cuerpo y mente equilibrados con energía renovada.",
    price: "$17.000",
    originalPrice: "$19.000",
    discount: "11%",
    priceNote: "por sesión",
    badge: "✨ Más Popular",
    highlight: true,
    active: true,
    imageUrl: "/assets/combos/armonia-terapia.png",
    services: ["Baño Armonía con cosmética", "Corte de pelo y deslanado", "Masaje relajante", "Terapia holística a elección", "Aromaterapia incluida"],
  },
  {
    id: "com-premium",
    name: "Spa Premium + Todo",
    description: "La experiencia más completa para tu mejor amigo.",
    price: "$24.000",
    originalPrice: "$28.000",
    discount: "14%",
    priceNote: "por sesión",
    badge: "👑 Premium Total",
    highlight: false,
    active: true,
    imageUrl: "/assets/combos/spa-premium-todo.png",
    services: ["Baño Spa Premium completo", "Estética y peluquería", "Masaje terapéutico", "Reiki + Péndulo", "Aromaterapia + Flores de Bach"],
  },
];

function ComboImage({ imageUrl, name, highlight }: { imageUrl: string; name: string; highlight: boolean }) {
  const [errored, setErrored] = useState(false);
  if (!imageUrl || errored) {
    return (
      <div style={{ height: 160, background: highlight ? "linear-gradient(135deg,#EDE9FE,#DDD6FE)" : "linear-gradient(135deg,#F5F0FF,#EDE9FE)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <ImageOff size={28} color={highlight ? "#7C3AED" : "#A78BFA"} strokeWidth={1.5} />
        <span style={{ fontSize: 11, color: highlight ? "#7C3AED" : "#A78BFA", fontWeight: 600 }}>Sin imagen</span>
      </div>
    );
  }
  return (
    <div style={{ height: 160, overflow: "hidden" }}>
      <img src={imageUrl} alt={name} onError={() => setErrored(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }} />
    </div>
  );
}

function EditableComboPrice({ combo, onSaved }: {
  combo: Combo;
  onSaved: (price: string, originalPrice: string, discount: string, priceNote: string) => void;
}) {
  const { isAdmin, password } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(combo.price);
  const [draftOriginal, setDraftOriginal] = useState(combo.originalPrice);
  const [draftDiscount, setDraftDiscount] = useState(combo.discount);
  const [draftNote, setDraftNote] = useState(combo.priceNote);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftPrice(combo.price);
    setDraftOriginal(combo.originalPrice);
    setDraftDiscount(combo.discount);
    setDraftNote(combo.priceNote);
  }, [combo.price, combo.originalPrice, combo.discount, combo.priceNote]);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/combos/${combo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({
          price: draftPrice.trim(),
          originalPrice: draftOriginal.trim(),
          discount: draftDiscount.trim(),
          priceNote: draftNote.trim(),
        }),
      });
      onSaved(draftPrice.trim(), draftOriginal.trim(), draftDiscount.trim(), draftNote.trim());
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() {
    setDraftPrice(combo.price);
    setDraftOriginal(combo.originalPrice);
    setDraftDiscount(combo.discount);
    setDraftNote(combo.priceNote);
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ background: combo.highlight ? "#FFFBEB" : "#F5F0FF", borderRadius: 12, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Precio actual</label>
        <input ref={inputRef} value={draftPrice} onChange={e => setDraftPrice(e.target.value)} placeholder="ej: $14.000" onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          style={{ border: "1.5px solid #a78bfa", borderRadius: 8, padding: "5px 10px", fontSize: 15, fontWeight: 800, color: combo.highlight ? "#D97706" : "#7C3AED", outline: "none", background: "white", width: "100%" }} />
        <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Precio original (tachado)</label>
        <input value={draftOriginal} onChange={e => setDraftOriginal(e.target.value)} placeholder="ej: $15.500"
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#6B7280", outline: "none", background: "white", width: "100%" }} />
        <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Descuento</label>
        <input value={draftDiscount} onChange={e => setDraftDiscount(e.target.value)} placeholder="ej: 10%"
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#6B7280", outline: "none", background: "white", width: "100%" }} />
        <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nota del precio</label>
        <input value={draftNote} onChange={e => setDraftNote(e.target.value)} placeholder="ej: por sesión"
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#6B7280", outline: "none", background: "white", width: "100%" }} />
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "#7C3AED", color: "white", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "…" : "✓ Guardar"}
          </button>
          <button onClick={cancel}
            style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer" }}>
            ✕ Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isAdmin ? () => setEditing(true) : undefined}
      title={isAdmin ? "Clic para editar precio" : undefined}
      style={{
        display: "inline-flex", alignItems: "baseline", gap: 5, position: "relative",
        background: flash ? "#D1FAE5" : (combo.highlight ? "linear-gradient(135deg,#FEF9EE,#FEF3C7)" : "#EDE9FE"),
        borderRadius: 10, padding: "7px 14px",
        cursor: isAdmin ? "pointer" : "default",
        border: isAdmin ? "1.5px dashed #a78bfa" : "none",
        transition: "background 0.3s",
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 900, color: combo.highlight ? "#D97706" : "#7C3AED" }}>
        {combo.price || "Consultar"}
      </span>
      {combo.priceNote && combo.price && (
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>{combo.priceNote}</span>
      )}
      {isAdmin && (
        <span style={{ position: "absolute", top: -7, right: -7, fontSize: 10, background: "#7C3AED", color: "white", borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</span>
      )}
    </div>
  );
}

function ComboCard({ combo, onPriceUpdate }: { combo: Combo; onPriceUpdate: (id: string, price: string, originalPrice: string, discount: string, priceNote: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        border: combo.highlight ? "2px solid #7C3AED" : "1px solid #E8E3F4",
        background: combo.highlight ? "linear-gradient(160deg,#faf8ff 0%,#f3eeff 100%)" : "white",
        boxShadow: hovered
          ? combo.highlight ? "0 12px 36px rgba(124,58,237,0.22)" : "0 8px 28px rgba(124,58,237,0.12)"
          : combo.highlight ? "0 4px 20px rgba(124,58,237,0.14)" : "0 2px 10px rgba(124,58,237,0.06)",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <ComboImage imageUrl={combo.imageUrl} name={combo.name} highlight={combo.highlight} />

      <div style={{ background: combo.highlight ? "#7C3AED" : "#F5F0FF", padding: "7px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: combo.highlight ? "white" : "#7C3AED", letterSpacing: "0.02em" }}>
          {combo.badge || combo.name}
        </span>
        {combo.highlight && <Star size={13} fill="white" color="white" />}
      </div>

      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontWeight: 900, fontSize: "1.1rem", color: "#4C1D95", marginBottom: 4, lineHeight: 1.2 }}>{combo.name}</h3>
        <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 14, lineHeight: 1.5 }}>{combo.description}</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {combo.services.map((s, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "#374151" }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: combo.highlight ? "#EDE9FE" : "#F9F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "#7C3AED", fontWeight: 700 }}>✓</span>
              <span style={{ fontWeight: 500 }}>{s}</span>
            </li>
          ))}
        </ul>

        {combo.discount && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Sparkles size={12} color="#F59E0B" />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#D97706" }}>
              {combo.discount} de descuento
              {combo.originalPrice && (
                <span style={{ fontWeight: 400, color: "#9CA3AF" }}> (antes {combo.originalPrice})</span>
              )}
            </span>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <EditableComboPrice
            combo={combo}
            onSaved={(price, originalPrice, discount, priceNote) =>
              onPriceUpdate(combo.id, price, originalPrice, discount, priceNote)
            }
          />
        </div>

        <button
          onClick={scrollToReservas}
          onMouseEnter={e => { const b = e.currentTarget; b.style.background = "#6D28D9"; b.style.color = "white"; b.style.border = "2px solid #6D28D9"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.background = combo.highlight ? "#7C3AED" : "white"; b.style.color = combo.highlight ? "white" : "#7C3AED"; b.style.border = combo.highlight ? "2px solid transparent" : "2px solid #7C3AED"; }}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: combo.highlight ? "#7C3AED" : "white", color: combo.highlight ? "white" : "#7C3AED", border: combo.highlight ? "2px solid transparent" : "2px solid #7C3AED", fontWeight: 700, fontSize: 13, padding: "11px 0", borderRadius: 14, cursor: "pointer", transition: "all 0.15s ease", boxShadow: combo.highlight ? "0 4px 14px rgba(124,58,237,0.3)" : "none" }}
        >
          <Calendar size={14} /> Reservar combo
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 24, border: "1px solid #E8E3F4", overflow: "hidden", background: "white" }}>
      <div style={{ height: 160, background: "#F3F4F6" }} />
      <div style={{ height: 40, background: "#F5F0FF" }} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 18, background: "#F3F4F6", borderRadius: 6, width: "60%" }} />
        <div style={{ height: 13, background: "#F3F4F6", borderRadius: 6, width: "80%" }} />
        <div style={{ height: 36, background: "#EDE9FE", borderRadius: 10, width: "50%", marginTop: 6 }} />
        <div style={{ height: 44, background: "#F5F0FF", borderRadius: 14, marginTop: 2 }} />
      </div>
    </div>
  );
}

export default function CombosSection() {
  const [combos, setCombos] = useState<Combo[]>(FALLBACK_COMBOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/combos"))
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setCombos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handlePriceUpdate(id: string, price: string, originalPrice: string, discount: string, priceNote: string) {
    setCombos(prev => prev.map(c => c.id === id ? { ...c, price, originalPrice, discount, priceNote } : c));
  }

  if (!loading && combos.length === 0) return null;

  return (
    <section id="combos" className="py-14" style={{ background: "linear-gradient(180deg,#faf8ff 0%,#f3eeff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EDE9FE", borderRadius: 20, padding: "5px 16px", marginBottom: 14 }}>
            <Sparkles size={13} color="#7C3AED" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.05em", textTransform: "uppercase" }}>Paquetes especiales</span>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "1.6rem", color: "#111827", marginBottom: 10, lineHeight: 1.2 }}>
            Combos con precio especial
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Servicios combinados pensados para el bienestar completo de tu mascota. Más cuidado, mejor precio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : combos.map(combo => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  onPriceUpdate={handlePriceUpdate}
                />
              ))
          }
        </div>
      </div>
    </section>
  );
}
