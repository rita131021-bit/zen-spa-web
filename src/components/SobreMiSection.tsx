import { Calendar, Heart, Leaf, Shield, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { scrollToReservas } from "@/lib/scrollToReservas";

/* ─── useReveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── PawIcon ─── */
function PawIcon({ size = 16, color = "#7C3AED" }: { size?: number; color?: string }) {
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

/* ─── Badge pill ─── */
function Badge({ text }: { text: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      background: "white", border: "1px solid #DDD6FE",
      borderRadius: 999, padding: "5px 14px", marginBottom: 18,
    }}>
      <PawIcon size={12} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {text}
      </span>
    </div>
  );
}

/* ─── Formation Card ─── */
/* Grooming icon */
function IconGrooming() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#EDE9FE"/>
      <path d="M20 17l10 10" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M30 17l-10 10" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="19" cy="35" r="4.5" stroke="#7C3AED" strokeWidth="2"/>
      <circle cx="31" cy="35" r="4.5" stroke="#7C3AED" strokeWidth="2"/>
      <path d="M19 30.5v-4M31 30.5v-4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
      {/* paw mark */}
      <ellipse cx="41" cy="19" rx="1.4" ry="1.8" fill="#C4B5FD"/>
      <ellipse cx="43.8" cy="17.2" rx="1.2" ry="1.5" fill="#C4B5FD"/>
      <ellipse cx="38.2" cy="17.2" rx="1.2" ry="1.5" fill="#C4B5FD"/>
      <path d="M37 21.5c0-2.6 1.7-4.5 4-4.5s4 1.9 4 4.5c0 1.8-1.1 3.3-2.7 3.9l-1.3 1.1-1.3-1.1C38.1 24.8 37 23.3 37 21.5z" fill="#A78BFA"/>
    </svg>
  );
}
/* Terapias lotus icon */
function IconTerapias() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#EDE9FE"/>
      <path d="M28 40V28" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M28 28c0-5.5-4-9.5-8-9.5 0 5.5 3.5 9.5 8 9.5z" fill="#C4B5FD"/>
      <path d="M28 28c0-5.5 4-9.5 8-9.5 0 5.5-3.5 9.5-8 9.5z" fill="#A78BFA"/>
      <path d="M28 28c-5.5 0-8.5-3.2-9-7.2 4-.6 8 1.2 9 7.2z" fill="#DDD6FE"/>
      <path d="M28 28c5.5 0 8.5-3.2 9-7.2-4-.6-8 1.2-9 7.2z" fill="#DDD6FE"/>
      <ellipse cx="28" cy="40.5" rx="4.5" ry="1.2" fill="#DDD6FE"/>
    </svg>
  );
}
/* Reiki meditation */
function IconReiki() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#EDE9FE"/>
      <circle cx="28" cy="19" r="4.5" stroke="#7C3AED" strokeWidth="2"/>
      <path d="M19 37c0-5 4-9 9-9s9 4 9 9" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 33.5l-3.5 6.5M34 33.5l3.5 6.5" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Aura */}
      <path d="M28 12v-2.5M22.5 13.5l-2-2M33.5 13.5l2-2" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 27c-1.5 0-2.5.7-2.5 2s1 2 2.5 2" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M39 27c1.5 0 2.5.7 2.5 2s-1 2-2.5 2" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
/* Guardería house + paw */
function IconGuarderia() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#EDE9FE"/>
      <path d="M16 30l12-10 12 10" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="20" y="30" width="16" height="12" rx="2.5" stroke="#7C3AED" strokeWidth="2"/>
      <rect x="25.5" y="35" width="5" height="7" rx="1.5" stroke="#A78BFA" strokeWidth="1.6"/>
      {/* paw on roof */}
      <ellipse cx="34" cy="22" rx="1.3" ry="1.6" fill="#A78BFA"/>
      <ellipse cx="36.5" cy="20.5" rx="1.1" ry="1.4" fill="#A78BFA"/>
      <ellipse cx="31.5" cy="20.5" rx="1.1" ry="1.4" fill="#A78BFA"/>
      <path d="M31 24c0-1.8 1.1-3.1 3-3.1s3 1.3 3 3.1c0 1.2-.7 2.2-1.8 2.7l-.9.8-.9-.8C32 25.9 31 25 31 24z" fill="#C4B5FD"/>
    </svg>
  );
}

function FormationCard({
  icon, title, institution, desc,
}: {
  icon: React.ReactNode;
  title: string;
  institution?: string;
  desc: string;
}) {
  return (
    <div style={{
      background: "white",
      border: "1.5px solid #EDE9FE",
      borderRadius: 22,
      padding: "32px 24px 26px",
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16,
      boxShadow: "0 2px 18px rgba(124,58,237,0.07)",
    }}>
      {icon}
      <div>
        <p style={{ fontSize: 15.5, fontWeight: 800, color: "#4C1D95", margin: "0 0 4px", lineHeight: 1.3 }}>{title}</p>
        {institution && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <MapPin size={11} color="#9CA3AF" />
            <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>{institution}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.65, margin: 0, flex: 1 }}>{desc}</p>
      <Heart size={16} color="#DDD6FE" fill="#DDD6FE" />
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function SobreMiSection() {
  const heroLeft  = useReveal(0.12);
  const heroRight = useReveal(0.12);
  const historia  = useReveal(0.1);
  const formacion = useReveal(0.08);

  const fadeUp = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  });

  return (
    <>

      {/* ══════════════════════════════════════════════
          1 · HERO — SOBRE MÍ
          Photo: right half of sobre-mi-hero.png (1740×904)
          CSS crops to show only the Romina+kitten portion
      ══════════════════════════════════════════════ */}
      <section
        id="sobre-mi"
        style={{
          background: "linear-gradient(140deg, #f7f4ff 0%, #efe8ff 45%, #fff 100%)",
          padding: "80px 0 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, #ddd6fe 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse, #ede9fe 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}>

            {/* LEFT: Text content */}
            <div ref={heroLeft.ref} style={fadeUp(heroLeft.visible, 0)}>
              <Badge text="Sobre Romina" />

              <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.9rem)", fontWeight: 900, color: "#111827", lineHeight: 1.15, margin: "0 0 10px" }}>
                Soy{" "}
                <span style={{ color: "#7C3AED" }}>Romina Alejandra Robles</span>
              </h2>

              <p style={{ fontSize: 15.5, fontWeight: 600, color: "#6B7280", margin: "0 0 24px" }}>
                Fundadora de Zen Spa para Mascotas
              </p>

              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, margin: "0 0 16px" }}>
                Mi camino comenzó hace más de 17 años con la peluquería y estética canina. Día a día, trabajando con mascotas, entendí que ellas también necesitan calma, conexión y bienestar emocional.
              </p>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, margin: "0 0 32px" }}>
                Con el tiempo, Zen evolucionó hacia un espacio holístico para mascotas, incorporando guardería, spa emocional y terapias alternativas orientadas al equilibrio físico, mental y energético.
              </p>

              {/* Three values */}
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                {[
                  { icon: <Heart size={20} color="#7C3AED" fill="#EDE9FE" />, label: "Pasión", sub: "por lo que hacemos" },
                  { icon: <Leaf size={20} color="#7C3AED" />, label: "Enfoque", sub: "holístico y natural" },
                  { icon: <Shield size={20} color="#7C3AED" />, label: "Confianza", sub: "y amor en cada detalle" },
                ].map((v) => (
                  <div key={v.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {v.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#4C1D95" }}>{v.label}</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>{v.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Photo */}
            <div ref={heroRight.ref} style={{ display: "flex", justifyContent: "center", alignItems: "center", ...fadeUp(heroRight.visible, 150) }}>
              <img
                src="/assets/sobre-mi-hero.png?v=2"
                alt="Romina Alejandra Robles especialista en bienestar animal"
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: "auto",
                  display: "block",
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2 · MI HISTORIA
          Photo: right half of mi-historia.png (1017×330)
          Same crop technique — right portion = certificate photo
      ══════════════════════════════════════════════ */}
      <section style={{
        background: "white",
        padding: "80px 0",
        borderTop: "1px solid #F0EBFF",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: History text */}
            <div ref={historia.ref} style={fadeUp(historia.visible, 0)}>
              <Badge text="Mi historia" />

              <h2 style={{ fontSize: "clamp(1.8rem, 2.9vw, 2.5rem)", fontWeight: 900, color: "#111827", lineHeight: 1.2, margin: "0 0 24px" }}>
                Un camino de{" "}
                <span style={{ color: "#7C3AED" }}>amor</span>,{" "}
                <span style={{ color: "#7C3AED" }}>aprendizaje</span>{" "}
                y evolución
              </h2>

              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, margin: "0 0 16px" }}>
                Mi camino comenzó hace más de 17 años con la peluquería y estética canina, trabajando día a día con mascotas y entendiendo que ellas también necesitan calma, conexión y bienestar emocional.
              </p>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, margin: "0 0 16px" }}>
                Con el tiempo, Zen evolucionó hacia un espacio holístico para mascotas, incorporando guardería, spa emocional y terapias alternativas orientadas al equilibrio físico, mental y energético.
              </p>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, margin: "0 0 28px" }}>
                Cada mascota que llega a Zen es única y merece una experiencia personalizada, respetuosa y llena de amor.
              </p>

              {/* Highlighted quote */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                background: "linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)",
                border: "1px solid #DDD6FE",
                borderRadius: 18, padding: "18px 20px",
              }}>
                <div style={{ background: "#7C3AED", borderRadius: 12, padding: 10, display: "flex", flexShrink: 0, marginTop: 2 }}>
                  <Heart size={18} color="white" fill="white" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#4C1D95", margin: 0, lineHeight: 1.65 }}>
                  En Zen no solo cuidamos su apariencia, cuidamos su bienestar integral.
                </p>
              </div>
            </div>

            {/* RIGHT: Imagen completa sin recorte, sin textos */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", ...fadeUp(historia.visible, 150) }}>
              <div style={{ width: "100%", maxWidth: 520 }}>
                <div
                  style={{
                    borderRadius: 28,
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(124,58,237,0.18)",
                    border: "2px solid rgba(196,181,253,0.35)",
                    background: "#f3eeff",
                    lineHeight: 0,
                  }}
                >
                  <img
                    src="/assets/hero-maestra.png"
                    alt="Romina Alejandra Robles con diploma de Maestría en Reiki"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3 · MI FORMACIÓN
          Native HTML cards — matching reference exactly
          4 columns, illustrated SVG icons, premium styling
      ══════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(180deg, #faf8ff 0%, #fff 100%)",
        padding: "72px 0 80px",
        borderTop: "1px solid #F0EBFF",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div ref={formacion.ref} style={{ marginBottom: 44, ...fadeUp(formacion.visible, 0) }}>
            <Badge text="Mi formación" />
            <h3 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.1rem)", fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
              Siempre aprendiendo para brindar lo mejor
            </h3>
            <p style={{ fontSize: 14.5, color: "#9CA3AF", margin: 0 }}>
              Certificaciones y especializaciones que respaldan cada servicio de Zen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <IconGrooming />, title: "Peluquería y estética canina", desc: "Formación profesional en peluquería, estética y cuidado integral de perros.", delay: 0 },
              { icon: <IconTerapias />, title: "Terapias holísticas para mascotas", desc: "Especialización en terapias naturales para el bienestar físico, emocional y energético.", delay: 100 },
              { icon: <IconReiki />, title: "Maestría en Reiki", institution: "Centro Quan", desc: "Formación profesional en Reiki Usui para equilibrar energía y emociones.", delay: 200 },
              { icon: <IconGuarderia />, title: "Guardería emocional y bienestar animal", desc: "Especialización en bienestar, convivencia saludable y cuidado emocional en guardería.", delay: 300 },
            ].map((card) => (
              <div key={card.title} style={fadeUp(formacion.visible, card.delay)}>
                <FormationCard icon={card.icon} title={card.title} institution={card.institution} desc={card.desc} />
              </div>
            ))}
          </div>

        </div>
      </section>

    </>
  );
}
