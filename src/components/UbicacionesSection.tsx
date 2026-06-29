import { Navigation } from "lucide-react";
import type React from "react";

function PawIcon({ className = "", style: s }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={s} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}


function MapVisual() {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        lineHeight: 0,
      }}
    >
      <img
        src="/assets/mapa-original.png"
        alt="Mapa de ubicaciones Zen Pet Spa"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default function UbicacionesSection() {
  return (
    <section id="ubicaciones" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop: narrower sides, wider map */}
        <div
          className="hidden md:grid gap-6 items-start"
          style={{ gridTemplateColumns: "220px 1fr" }}
        >

          {/* ── Col 1: Direcciones — más compacta ── */}
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", marginBottom: 18 }}>
              Ubicaciones
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { title: "Villaguay al 1000", sub: "Spa" },
                { title: "Calle Juan Báez", sub: "Guardería Canina" },
              ].map((loc) => (
                <div key={loc.title} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#EDE9FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PawIcon className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", margin: 0 }}>
                      {loc.title}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{loc.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.open("https://maps.google.com", "_blank")}
              style={{
                marginTop: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1.5px solid #7C3AED",
                color: "#7C3AED",
                fontWeight: 700,
                fontSize: 12,
                padding: "8px 16px",
                borderRadius: 12,
                background: "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#EDE9FE"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Navigation size={12} />
              Cómo llegar
            </button>
          </div>

          {/* ── Col 2: Mapa — más ancho ── */}
          <MapVisual />
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col gap-5 md:hidden">
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", marginBottom: 14 }}>
              Ubicaciones
            </h2>
            {[
              { title: "Villaguay al 1000", sub: "Spa para mascotas" },
              { title: "Calle Juan Báez", sub: "Guardería Canina" },
            ].map((loc) => (
              <div key={loc.title} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#EDE9FE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <PawIcon className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#111827", margin:0 }}>{loc.title}</p>
                  <p style={{ fontSize:11.5, color:"#9CA3AF", margin:"2px 0 0" }}>{loc.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <MapVisual />
        </div>

      </div>
    </section>
  );
}
