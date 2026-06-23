import { Calendar, ShieldCheck, Heart, User } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";

function PawIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}

function BotanicalRight() {
  return (
    <svg
      viewBox="0 0 140 340"
      fill="none"
      className="absolute pointer-events-none"
      style={{ right: 0, top: 0, width: 130, height: "100%", opacity: 0.30, zIndex: 0 }}
      preserveAspectRatio="xMaxYMin meet"
    >
      <path d="M120 340 Q112 280 100 220 Q88 160 78 100 Q68 50 80 10" stroke="#b09fe8" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M92 200 Q118 188 124 170" stroke="#b09fe8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M97 230 Q126 215 130 195" stroke="#b09fe8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M86 168 Q110 152 116 132" stroke="#b09fe8" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M82 138 Q104 120 108 100" stroke="#b09fe8" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M80 108 Q100 90 102 72" stroke="#b09fe8" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="126" cy="168" rx="9" ry="5" fill="#c4b5fd" transform="rotate(-30 126 168)"/>
      <ellipse cx="132" cy="193" rx="9" ry="5" fill="#c4b5fd" transform="rotate(-25 132 193)"/>
      <ellipse cx="118" cy="130" rx="8" ry="4.5" fill="#c4b5fd" transform="rotate(-35 118 130)"/>
      <ellipse cx="110" cy="98" rx="7" ry="4" fill="#c4b5fd" transform="rotate(-38 110 98)"/>
      <ellipse cx="104" cy="70" rx="7" ry="3.8" fill="#c4b5fd" transform="rotate(-40 104 70)"/>
      <path d="M85 155 Q62 148 55 132" stroke="#b09fe8" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M83 125 Q63 115 58 100" stroke="#b09fe8" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="54" cy="130" rx="8" ry="4" fill="#ddd6fe" transform="rotate(20 54 130)"/>
      <ellipse cx="56" cy="98" rx="7" ry="3.8" fill="#ddd6fe" transform="rotate(25 56 98)"/>
      <circle cx="80" cy="10" r="5.5" fill="#ede9fe"/>
      <circle cx="88" cy="4" r="4" fill="#ddd6fe"/>
      <circle cx="73" cy="6" r="3.5" fill="#ede9fe"/>
      <circle cx="92" cy="12" r="3" fill="#ddd6fe"/>
      <g transform="translate(102, 48)">
        <circle cx="0" cy="-5" r="2.2" fill="#c4b5fd"/>
        <circle cx="4.7" cy="-1.5" r="2.2" fill="#c4b5fd"/>
        <circle cx="2.9" cy="4" r="2.2" fill="#c4b5fd"/>
        <circle cx="-2.9" cy="4" r="2.2" fill="#c4b5fd"/>
        <circle cx="-4.7" cy="-1.5" r="2.2" fill="#c4b5fd"/>
        <circle cx="0" cy="0" r="2" fill="#f5f0ff"/>
      </g>
      <g transform="translate(86, 28)">
        <circle cx="0" cy="-4" r="1.8" fill="#a78bfa"/>
        <circle cx="3.8" cy="-1.2" r="1.8" fill="#a78bfa"/>
        <circle cx="2.3" cy="3.2" r="1.8" fill="#a78bfa"/>
        <circle cx="-2.3" cy="3.2" r="1.8" fill="#a78bfa"/>
        <circle cx="-3.8" cy="-1.2" r="1.8" fill="#a78bfa"/>
        <circle cx="0" cy="0" r="1.6" fill="#ede9fe"/>
      </g>
    </svg>
  );
}

function BotanicalLeft() {
  return (
    <svg
      viewBox="0 0 90 220"
      fill="none"
      className="absolute pointer-events-none"
      style={{ left: 0, bottom: 0, width: 72, height: "75%", opacity: 0.22, zIndex: 0 }}
      preserveAspectRatio="xMinYMax meet"
    >
      <path d="M45 220 Q38 180 28 140 Q18 100 32 55 Q40 25 42 0" stroke="#b09fe8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M30 140 Q6 128 2 110" stroke="#b09fe8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M28 112 Q5 98 3 80" stroke="#b09fe8" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M32 168 Q8 158 4 140" stroke="#b09fe8" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <ellipse cx="2" cy="108" rx="7" ry="3.5" fill="#ddd6fe" transform="rotate(30 2 108)"/>
      <ellipse cx="3" cy="79" rx="6.5" ry="3.2" fill="#ddd6fe" transform="rotate(35 3 79)"/>
      <ellipse cx="3" cy="138" rx="6" ry="3" fill="#ddd6fe" transform="rotate(25 3 138)"/>
      <circle cx="42" cy="0" r="4" fill="#ede9fe"/>
      <circle cx="48" cy="5" r="3" fill="#ddd6fe"/>
      <circle cx="37" cy="4" r="2.5" fill="#ede9fe"/>
    </svg>
  );
}

function PawDecor({
  style,
  size = 32,
  opacity = 0.38,
}: {
  style: React.CSSProperties;
  size?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="#c4b5fd"
      className="absolute pointer-events-none"
      style={{ width: size, height: size, opacity, ...style }}
    >
      <ellipse cx="10" cy="8" rx="4" ry="5"/>
      <ellipse cx="18" cy="5" rx="3.5" ry="4.5"/>
      <ellipse cx="26" cy="5" rx="3.5" ry="4.5"/>
      <ellipse cx="33" cy="8" rx="4" ry="5"/>
      <path d="M20 14c-7 0-13 5-13 11C7 29 11 33 20 33s13-4 13-8C33 19 27 14 20 14z"/>
    </svg>
  );
}

function Florcita({
  style,
  size = 18,
  color = "#c4b5fd",
  opacity = 0.35,
}: {
  style: React.CSSProperties;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      className="absolute pointer-events-none"
      style={{ width: size, height: size, opacity, ...style }}
    >
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={15 + 7 * Math.sin((angle * Math.PI) / 180)}
          cy={15 - 7 * Math.cos((angle * Math.PI) / 180)}
          rx="4"
          ry="5.5"
          fill={color}
          transform={`rotate(${angle} ${15 + 7 * Math.sin((angle * Math.PI) / 180)} ${15 - 7 * Math.cos((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="15" cy="15" r="3.5" fill="#f5f0ff"/>
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #faf8ff 0%, #f3eeff 50%, #ffffff 100%)" }}
    >
      <BotanicalRight />
      <BotanicalLeft />

      <PawDecor style={{ top: "15%", right: "34%", zIndex: 1 }} size={26} opacity={0.38} />
      <PawDecor style={{ top: "8%", right: "18%", zIndex: 1 }} size={17} opacity={0.28} />
      <PawDecor style={{ top: "55%", left: "48%", zIndex: 1 }} size={13} opacity={0.20} />

      <Florcita style={{ top: "12%", right: "22%", zIndex: 1 }} size={15} opacity={0.26} />
      <Florcita style={{ top: "30%", right: "10%", zIndex: 1 }} size={12} color="#a78bfa" opacity={0.22} />
      <Florcita style={{ bottom: "22%", left: "46%", zIndex: 1 }} size={11} opacity={0.18} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center" style={{ minHeight: 440, gap: 0 }}>

          {/* ── Columna izquierda — reducida ~15% ── */}
          <div className="relative z-10" style={{ maxWidth: "88%" }}>
            <div className="inline-flex items-center gap-2 border border-purple-300 rounded-full px-3 py-1.5 mb-3 bg-white/80">
              <PawIcon className="w-3 h-3 text-purple-600" />
              <span className="text-[9.5px] font-semibold text-purple-700 tracking-wide">
                Bienestar, amor y terapias para tu mascota
              </span>
            </div>

            <h1
              className="font-black text-gray-900 leading-[1.05] mb-2.5"
              style={{ fontWeight: 900, fontSize: "clamp(1.7rem, 3.5vw, 2.35rem)" }}
            >
              Un espacio de<br />bienestar total.
            </h1>

            <p className="text-gray-500 text-[12px] mb-3 leading-relaxed max-w-xs">
              Cuidado profesional, amor y terapias que mejoran la calidad de vida de tu mascota.
            </p>

            <div className="space-y-1.5 mb-4">
              {[
                "Libre de estrés, con amor real",
                "Apoyo terapéutico no invasivo y natural",
                "Complementa su cuidado veterinario",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <PawIcon className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-800 text-[11.5px] font-medium">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={scrollToReservas}
              className="flex items-center gap-2 text-gray-900 font-extrabold px-5 py-2.5 rounded-xl text-[12px] transition-all shadow-md mb-2 hover:brightness-95 active:scale-[0.98]"
              style={{ backgroundColor: "#F59E0B" }}
            >
              <Calendar size={14} />
              Reservar Cita
            </button>

            <div className="flex items-center gap-1.5 mb-3.5">
              <PawIcon className="w-3 h-3 text-purple-600" />
              <span className="text-purple-700 text-[9.5px] font-bold">El hospedaje para tu mascota</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 max-w-[300px]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Proporcionamos la marca de su alimento, ración y horario, excepto aquel perrito que
                  consuma alimento especial; se motiva traerlo para evitar problemas gastrointestinales.
                </p>
              </div>
            </div>
          </div>

          {/* ── Columna derecha — imagen hero unificada ── */}
          <div
            className="relative flex items-center justify-center md:justify-start"
            style={{ alignSelf: "stretch" }}
          >
            <div style={{ width: "100%", maxWidth: 360, transform: "translateX(-20px)" }}>
              <img
                src="/assets/hero-principal.png?v=3"
                alt="Especialista en bienestar animal"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 28,
                  boxShadow: "0 16px 48px rgba(124,58,237,0.18)",
                  border: "2px solid rgba(196,181,253,0.35)",
                }}
              />

              {/* Badge debajo — sin superposición */}
              <div
                style={{
                  marginTop: 16,
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "white", borderRadius: 16,
                  border: "1px solid #EDE9FE",
                  boxShadow: "0 8px 28px rgba(124,58,237,0.14)",
                  padding: "10px 16px",
                }}
              >
                <div className="bg-purple-100 rounded-full p-1.5 flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <div>
                  <p className="text-[12.5px] font-extrabold text-gray-900 leading-snug m-0">Agenda hoy</p>
                  <p className="text-[10px] leading-snug text-gray-500 m-0">y dale a tu mascota el cuidado que merece.</p>
                </div>
                <Heart className="w-3.5 h-3.5 text-amber-400 ml-1" fill="#FBBF24" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
