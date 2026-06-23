import { useState } from "react";
import { Navigation, Send } from "lucide-react";

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

import type React from "react";

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
  const [message, setMessage] = useState("");

  return (
    <section id="ubicaciones" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop: narrower sides, wider map */}
        <div
          className="hidden md:grid gap-6 items-start"
          style={{ gridTemplateColumns: "200px 1fr 220px" }}
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

          {/* ── Col 3: Chat — más compacto ── */}
          <div
            style={{
              background: "white",
              borderRadius: 18,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
            }}
          >
            {/* Chat header */}
            <div
              style={{
                borderBottom: "1px solid #F3F4F6",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#EDE9FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PawIcon className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "#22C55E",
                      border: "2px solid white",
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", margin: 0 }}>Chat online</p>
                  <p style={{ fontSize: 10.5, color: "#22C55E", fontWeight: 600, margin: 0 }}>En línea</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {[0,1,2].map((i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB" }} />
                ))}
              </div>
            </div>

            {/* Message bubble */}
            <div style={{ padding: "12px 12px 6px" }}>
              <div
                style={{
                  background: "#F3F4F6",
                  borderRadius: "14px 14px 14px 4px",
                  padding: "9px 12px",
                  fontSize: 12.5,
                  color: "#374151",
                  lineHeight: 1.45,
                  display: "inline-block",
                  maxWidth: "90%",
                }}
              >
                ¡Hola! ¿En qué podemos ayudarte hoy? 🐾
              </div>
              <p style={{ fontSize: 9.5, color: "#9CA3AF", textAlign: "left", marginTop: 4, paddingLeft: 4 }}>
                09:20
              </p>
            </div>

            {/* Input */}
            <div style={{ padding: "4px 10px 12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 11,
                  padding: "7px 10px",
                  background: "#FAFAFA",
                }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  style={{
                    flex: 1,
                    fontSize: 12,
                    outline: "none",
                    background: "transparent",
                    color: "#374151",
                    border: "none",
                    minWidth: 0,
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter" && message.trim()) setMessage(""); }}
                />
                <button
                  onClick={() => { if (message.trim()) setMessage(""); }}
                  style={{
                    color: "#7C3AED",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: 10, color: "#9CA3AF", marginTop: 5 }}>
                Respuesta rápida y personalizada
              </p>
            </div>
          </div>

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
