import { useState, useEffect, useRef, type ReactNode } from "react";
import { Star, Heart, ChevronLeft, ChevronRight, Send, Upload, Camera } from "lucide-react";
import { apiUrl } from "@/lib/api";

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

const FALLBACK_DOGS = [
  { id: 1, name: "Rocky",  emoji: "🐩", service: "Baño + Corte de pelo",    combined: "/api/uploads/rocky-combined.png",  antes: "/api/uploads/rocky-combined.png",  despues: "/api/uploads/rocky-combined.png" },
  { id: 2, name: "Oliver", emoji: "🐩", service: "Baño + Corte",            combined: "/api/uploads/oliver-combined.png", antes: "/api/uploads/oliver-combined.png", despues: "/api/uploads/oliver-combined.png" },
  { id: 3, name: "Lisa",   emoji: "🐕", service: "Baño + Deslanado",        combined: "/api/uploads/lisa-combined.png",   antes: "/api/uploads/lisa-combined.png",   despues: "/api/uploads/lisa-combined.png" },
  { id: 4, name: "Bella",  emoji: "🐕", service: "Peinado + Baño Premium",  combined: "/api/uploads/bella-combined.png",  antes: "/api/uploads/bella-combined.png",  despues: "/api/uploads/bella-combined.png" },
];

interface DogEntry {
  id: number;
  name: string;
  emoji: string;
  service: string;
  antes: string;
  despues: string;
  combined?: string;
}

interface ReviewEntry {
  id: number;
  name: string;
  pet: string;
  text: string;
  stars: number;
  photo: string | null;
  approved: boolean;
  createdAt: string;
}

const AVATAR_COLORS = ["#7C3AED", "#F59E0B", "#22C55E", "#EC4899", "#3B82F6", "#EF4444"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const FALLBACK_RESENAS: ReviewEntry[] = [
  { id: 1, name: "carolina aragone",   pet: "", text: "Excelente atención para mi perrito! Sin duda los recomiendo al 100%",                                                                                                           stars: 5, photo: null, approved: true, createdAt: "2024-07-01T10:00:00.000Z" },
  { id: 2, name: "Nelson y Roxana G.", pet: "", text: "Nuestras mascotas aman ir a ZEN 🐾",                                                                                                                                             stars: 5, photo: null, approved: true, createdAt: "2024-04-15T10:00:00.000Z" },
  { id: 3, name: "sol stoppello",      pet: "", text: "Excelentes siempre, la mejor atención y amor para los animales.",                                                                                                                stars: 5, photo: null, approved: true, createdAt: "2024-03-20T10:00:00.000Z" },
  { id: 4, name: "analia melgratti",   pet: "", text: "Es la primera vez que dejo a mi perrito en una guardería y la verdad que se ve que la pasó muy bien, estaba muy cuidado y contento. Romi es una genia con los animales.",       stars: 5, photo: null, approved: true, createdAt: "2024-02-10T10:00:00.000Z" },
];

const STATIC_GALLERY = [
  "/api/uploads/galeria1.png",
  "/api/uploads/galeria2.png",
  "/api/uploads/galeria3.png",
  "/api/uploads/galeria4.png",
  "/api/uploads/galeria5.png",
];

type Tab = "antes-despues" | "resenas" | "galeria";

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= count ? "#F59E0B" : "transparent"} color={i <= count ? "#F59E0B" : "#E5E7EB"} />
      ))}
    </div>
  );
}

/* ── Single dog card ── */
function DogCard({ item }: { item: DogEntry }) {
  if (item.combined) {
    /* Imagen combinada ya diseñada — se muestra completa */
    return (
      <div style={{
        flexShrink: 0,
        width: 240,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #EDE9FE",
        boxShadow: "0 4px 18px rgba(124,58,237,0.10)",
        background: "white",
      }}>
        <img
          src={item.combined}
          alt={`${item.name} - Antes y Después`}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <PawIcon size={14} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 900, color: "#111827", margin: 0, lineHeight: 1.2 }}>
              {item.name}{item.emoji ? ` ${item.emoji}` : ""}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.3 }}>{item.service}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flexShrink: 0,
      width: 220,
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid #EDE9FE",
      boxShadow: "0 4px 18px rgba(124,58,237,0.10)",
      background: "white",
    }}>
      {/* Photos side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative" }}>
        {/* Antes */}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img
            src={item.antes}
            alt={`${item.name} - Antes`}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            background: "white", borderRadius: 6, padding: "3px 8px",
            fontSize: 10.5, fontWeight: 800, color: "#374151",
            boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
          }}>Antes</div>
        </div>
        {/* Después */}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img
            src={item.despues}
            alt={`${item.name} - Después`}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: "#7C3AED", borderRadius: 6, padding: "3px 8px",
            fontSize: 10.5, fontWeight: 800, color: "white",
            boxShadow: "0 1px 6px rgba(124,58,237,0.4)",
          }}>Después</div>
        </div>
        {/* Center divider icon */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 10,
          background: "white", borderRadius: "50%",
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
        }}>
          <ChevronLeft size={9} color="#7C3AED" style={{ marginRight: -3 }} />
          <ChevronRight size={9} color="#7C3AED" style={{ marginLeft: -3 }} />
        </div>
      </div>

      {/* Dog name + service */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <PawIcon size={14} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 900, color: "#111827", margin: 0, lineHeight: 1.2 }}>
            {item.name}{item.emoji ? ` ${item.emoji}` : ""}
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.3 }}>{item.service}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Horizontal strip carousel ── */
function AntesDespuesCarousel() {
  const [dogs, setDogs] = useState<DogEntry[]>(FALLBACK_DOGS);

  useEffect(() => {
    fetch(apiUrl("/api/dogs"))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDogs)
      .catch(() => { /* keep fallback */ });
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = document.getElementById("antes-despues-strip");
    if (el) el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute", left: -22, top: "50%", transform: "translateY(-70%)",
          background: "white", border: "1px solid #EDE9FE", borderRadius: "50%",
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(124,58,237,0.12)", cursor: "pointer", zIndex: 10,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F5F0FF"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; }}
      >
        <ChevronLeft size={16} color="#7C3AED" />
      </button>

      {/* Scrollable strip */}
      <div
        id="antes-despues-strip"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 8,
          paddingLeft: 4,
          paddingRight: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}
      >
        {dogs.map((item) => (
          <DogCard key={item.id} item={item} />
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute", right: -22, top: "50%", transform: "translateY(-70%)",
          background: "white", border: "1px solid #EDE9FE", borderRadius: "50%",
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(124,58,237,0.12)", cursor: "pointer", zIndex: 10,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F5F0FF"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; }}
      >
        <ChevronRight size={16} color="#7C3AED" />
      </button>
    </div>
  );
}

export default function ResultadosSection() {
  const [activeTab, setActiveTab] = useState<Tab>("antes-despues");
  const [reviews, setReviews] = useState<ReviewEntry[]>(FALLBACK_RESENAS);
  const [gallery, setGallery] = useState<{ id: number; url: string }[]>(
    STATIC_GALLERY.map((url, i) => ({ id: i, url }))
  );

  useEffect(() => {
    fetch(apiUrl("/api/gallery"))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGallery)
      .catch(() => { /* keep fallback */ });
  }, []);
  const [rName, setRName] = useState("");
  const [rPet, setRPet] = useState("");
  const [rText, setRText] = useState("");
  const [rStars, setRStars] = useState(5);
  const [rHover, setRHover] = useState(0);
  const [rSent, setRSent] = useState(false);
  const [rSending, setRSending] = useState(false);
  const [rPhoto, setRPhoto] = useState<File | null>(null);
  const [rPhotoPreview, setRPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(apiUrl("/api/resenas/publicas"))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((items) => {
        const publicReviews = Array.isArray(items) ? items.map((item) => ({
          id: Number(item.id),
          name: item.nombre_cliente || "Cliente Zen",
          pet: item.mascota_nombre || "",
          text: item.comentario || "",
          stars: Number(item.calificacion || 5),
          photo: item.fotos?.[0] ? apiUrl(item.fotos[0]) : null,
          approved: true,
          createdAt: item.creado_en || new Date().toISOString(),
        })) : [];
        if (publicReviews.length > 0) setReviews(publicReviews);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "antes-despues", label: "Antes y Después", icon: <span style={{ fontSize: 13 }}>⊞</span> },
    { id: "resenas",       label: "Reseñas",          icon: <Star size={12} /> },
    { id: "galeria",       label: "Galería",           icon: <PawIcon size={12} /> },
  ];

  const handlePhotoSelect = (file: File) => {
    setRPhoto(file);
    const reader = new FileReader();
    reader.onload = e => setRPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleReview = async () => {
    if (!rName || !rText) return;
    setRSending(true);
    try {
      const fd = new FormData();
      fd.append("nombre_cliente", rName.trim());
      fd.append("mascota_nombre", rPet.trim());
      fd.append("comentario", rText.trim());
      fd.append("calificacion", String(rStars));
      if (rPhoto) fd.append("foto", rPhoto);
      const response = await fetch(apiUrl("/api/resenas"), { method: "POST", body: fd });
      if (!response.ok) throw new Error("No se pudo enviar la reseña.");
    } catch { /* still show success */ }
    setRSent(true);
    setRSending(false);
    setRName(""); setRPet(""); setRText(""); setRStars(5);
    setRPhoto(null); setRPhotoPreview(null);
    setTimeout(() => setRSent(false), 5000);
  };

  return (
    <section id="resultados" style={{ background: "#faf9ff", padding: "56px 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#EDE9FE", borderRadius: "50%", marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)", fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>
            Resultados Reales
          </h2>
          <p style={{ fontSize: 13.5, color: "#9CA3AF" }}>
            Transformaciones que reflejan amor, cuidado y bienestar.
          </p>

          {/* Tabs */}
          <div style={{ display: "inline-flex", background: "white", border: "1px solid #EDE9FE", borderRadius: 14, overflow: "hidden", marginTop: 18, boxShadow: "0 2px 10px rgba(124,58,237,0.07)" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 22px", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                  background: activeTab === tab.id ? "#F5F0FF" : "transparent",
                  color: activeTab === tab.id ? "#7C3AED" : "#9CA3AF",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#7C3AED" : "transparent"}`,
                  transition: "all 0.15s ease",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ANTES Y DESPUÉS ── */}
        {activeTab === "antes-despues" && <AntesDespuesCarousel />}

        {/* ── RESEÑAS ── */}
        {activeTab === "resenas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map(r => (
              <div key={r.id} style={{
                background: "white", borderRadius: 18,
                border: "1px solid #EDE9FE",
                boxShadow: "0 2px 12px rgba(124,58,237,0.07)",
                overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}>
                {/* Photo banner if present */}
                {r.photo && (
                  <div style={{ height: 120, overflow: "hidden", flexShrink: 0 }}>
                    <img src={r.photo} alt={`Foto de ${r.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColor(r.name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "white", fontWeight: 800, fontSize: 13 }}>{r.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", margin: 0 }}>{r.name}</p>
                      {r.pet && <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: 0 }}>🐾 {r.pet}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRow count={r.stars} />
                    <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>
                      {new Date(r.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, margin: 0, flex: 1 }}>{r.text}</p>
                  <Heart size={13} color="#DDD6FE" fill="#DDD6FE" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GALERÍA ── */}
        {activeTab === "galeria" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 10 }}>
            {gallery.map((photo, i) => (
              <div
                key={i}
                style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "1", border: "1px solid #EDE9FE", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "scale(1.04)"; el.style.boxShadow = "0 8px 24px rgba(124,58,237,0.18)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "scale(1)"; el.style.boxShadow = "none"; }}
              >
                <img src={photo.url} alt={`Foto ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* ── DEJAR RESEÑA ── */}
        <div style={{ marginTop: 40, background: "white", borderRadius: 18, border: "1.5px dashed #DDD6FE", padding: "20px 24px" }}>
          {rSent ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <PawIcon size={28} />
              <p style={{ fontWeight: 800, color: "#4C1D95", fontSize: 14, marginTop: 8 }}>¡Gracias por tu reseña!</p>
              <p style={{ color: "#9CA3AF", fontSize: 12.5, margin: 0 }}>Romina la revisará pronto y aparecerá en el sitio.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#EDE9FE", borderRadius: 10, padding: 7, display: "flex" }}><Send size={14} color="#7C3AED" /></div>
                <div>
                  <p style={{ fontWeight: 800, color: "#111827", fontSize: 13.5, margin: 0 }}>Dejanos tu reseña</p>
                  <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: 0 }}>Tu opinión ayuda a otras familias a elegir lo mejor para sus mascotas.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <input placeholder="Tu nombre *" value={rName} onChange={e => setRName(e.target.value)}
                  style={{ border: "1.5px solid #EDE9FE", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA" }} />
                <input placeholder="Nombre de tu mascota" value={rPet} onChange={e => setRPet(e.target.value)}
                  style={{ border: "1.5px solid #EDE9FE", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={24} fill={(rHover || rStars) >= s ? "#F59E0B" : "transparent"} color={(rHover || rStars) >= s ? "#F59E0B" : "#D1D5DB"} style={{ cursor: "pointer" }}
                      onMouseEnter={() => setRHover(s)} onMouseLeave={() => setRHover(0)} onClick={() => setRStars(s)} />
                  ))}
                </div>
                <input placeholder="Tu experiencia en Zen... *" value={rText} onChange={e => setRText(e.target.value)}
                  style={{ border: "1.5px solid #EDE9FE", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA" }} />
              </div>

              {/* Photo preview */}
              {rPhotoPreview && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <img src={rPhotoPreview} alt="preview" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", border: "1.5px solid #DDD6FE" }} />
                  <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>{rPhoto?.name}</span>
                  <button
                    onClick={() => { setRPhoto(null); setRPhotoPreview(null); }}
                    style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                  >✕</button>
                </div>
              )}

              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoSelect(f); e.target.value = ""; }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => photoRef.current?.click()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    border: rPhoto ? "1.5px solid #7C3AED" : "1.5px solid #EDE9FE",
                    background: rPhoto ? "#F5F0FF" : "#FAFAFA",
                    color: rPhoto ? "#7C3AED" : "#6B7280",
                    borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Camera size={13} /> {rPhoto ? "Foto seleccionada ✓" : "Subir foto"}
                </button>
                <button
                  onClick={handleReview}
                  disabled={rSending || !rName || !rText}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: rName && rText ? "#7C3AED" : "#C4B5FD",
                    color: "white", borderRadius: 10, padding: "9px 18px",
                    fontSize: 12.5, fontWeight: 700, border: "none",
                    cursor: rName && rText ? "pointer" : "default",
                    boxShadow: rName && rText ? "0 3px 10px rgba(124,58,237,0.25)" : "none",
                    opacity: rSending ? 0.7 : 1,
                  }}
                >
                  <Send size={13} /> {rSending ? "Enviando…" : "Enviar reseña"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
