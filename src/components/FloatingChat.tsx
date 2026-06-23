import { useState, useEffect } from "react";
import { X, MessageCircle, Calendar, Gift, HelpCircle } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";

/* ─── CONFIG ─── Change this to the real WhatsApp number ─── */
const WA_PHONE   = "5491100000000"; // Format: 54 9 (area code) (number) — no +, no spaces
const WA_MESSAGE = "Hola 🌸 Quiero consultar sobre los servicios de Zen Spa para Mascotas.";
const WA_URL     = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

/* ─── WhatsApp SVG icon ─── */
function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ─── Paw icon ─── */
function PawIcon({ size = 14, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}

/* ─── Quick action row ─── */
function QuickAction({
  icon, label, sub, onClick, color = "#7C3AED", bg = "#F5F0FF",
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  color?: string;
  bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", background: "white",
        border: "1.5px solid #EDE9FE",
        borderRadius: 14, padding: "10px 13px",
        cursor: "pointer", textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C4B5FD"; (e.currentTarget as HTMLButtonElement).style.background = "#FAFAFE"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE9FE"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
    >
      <div style={{ background: bg, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", margin: 0, lineHeight: 1.2 }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: 0 }}>{sub}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

/* ─── Main component ─── */
export default function FloatingChat() {
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse]     = useState(true);

  /* Appear after 2s, stop pulsing after 6s */
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2000);
    const t2 = setTimeout(() => setPulse(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* Stop pulse when opened */
  const handleToggle = () => {
    setOpen(v => !v);
    setPulse(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Backdrop (mobile) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.18)",
            zIndex: 9998,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Panel ── */}
      <div
        style={{
          position: "fixed",
          bottom: 96,
          right: 20,
          width: 300,
          zIndex: 9999,
          transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
        }}
      >
        <div style={{
          background: "white",
          borderRadius: 22,
          boxShadow: "0 12px 48px rgba(124,58,237,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #EDE9FE",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: 8, display: "flex" }}>
              <PawIcon size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.2 }}>Zen Spa para Mascotas</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }} />
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)" }}>En línea · Respondemos rápido</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", color: "white" }}>
              <X size={15} />
            </button>
          </div>

          {/* Greeting bubble */}
          <div style={{ padding: "14px 16px 4px" }}>
            <div style={{
              background: "#F5F0FF",
              border: "1px solid #EDE9FE",
              borderRadius: "4px 18px 18px 18px",
              padding: "11px 14px",
              display: "inline-block",
              maxWidth: "90%",
            }}>
              <p style={{ fontSize: 13, color: "#4C1D95", margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                ¡Hola! 🌸 ¿En qué podemos ayudarte hoy?
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>

            {/* WhatsApp — primary CTA */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#25D366", color: "white",
                borderRadius: 14, padding: "11px 14px",
                textDecoration: "none",
                boxShadow: "0 3px 14px rgba(37,211,102,0.32)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#20BD5C"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#25D366"; }}
            >
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WhatsAppIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Escribinos por WhatsApp</p>
                <p style={{ fontSize: 11.5, margin: 0, opacity: 0.88 }}>Consultas y reservas al instante</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>

            {/* Reservar turno */}
            <QuickAction
              icon={<Calendar size={16} />}
              label="Reservar turno"
              sub="Spa, Guardería y Terapias"
              onClick={() => { setOpen(false); scrollToReservas(); }}
            />

            {/* Consultar servicios */}
            <QuickAction
              icon={<HelpCircle size={16} />}
              label="Consultar servicios"
              sub="Precios y disponibilidad"
              onClick={() => { window.open(WA_URL, "_blank"); setOpen(false); }}
              color="#7C3AED"
              bg="#F5F0FF"
            />

            {/* Gift Cards */}
            <QuickAction
              icon={<Gift size={16} />}
              label="Gift Cards"
              sub="Regalá una experiencia Zen"
              onClick={() => { window.open(WA_URL, "_blank"); setOpen(false); }}
              color="#F59E0B"
              bg="#FFFBEB"
            />
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid #F3EEFF",
            padding: "9px 16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <PawIcon size={11} color="#C4B5FD" />
            <span style={{ fontSize: 11, color: "#C4B5FD", fontWeight: 600 }}>Zen Spa para Mascotas · Respondemos en minutos</span>
          </div>
        </div>
      </div>

      {/* ── FAB button ── */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
      >
        {/* Pulse ring */}
        {pulse && !open && (
          <div style={{
            position: "absolute", inset: -6,
            borderRadius: "50%",
            background: "rgba(37,211,102,0.25)",
            animation: "wa-pulse 1.6s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {/* Tooltip */}
        {!open && (
          <div style={{
            position: "absolute",
            right: "calc(100% + 12px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "white",
            border: "1px solid #EDE9FE",
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#4C1D95",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(124,58,237,0.14)",
            pointerEvents: "none",
            opacity: pulse ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            ¡Chateá con nosotros! 🌸
          </div>
        )}

        <button
          onClick={handleToggle}
          aria-label={open ? "Cerrar chat" : "Abrir chat"}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: open ? "#7C3AED" : "#25D366",
            color: "white",
            boxShadow: open
              ? "0 6px 24px rgba(124,58,237,0.4)"
              : "0 6px 24px rgba(37,211,102,0.45)",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: open ? "rotate(0deg) scale(1)" : "rotate(0deg) scale(1)",
          }}
        >
          <div style={{
            transition: "all 0.22s ease",
            transform: open ? "rotate(90deg) scale(0.85)" : "rotate(0deg) scale(1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {open ? <X size={22} /> : <WhatsAppIcon size={26} />}
          </div>
        </button>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
