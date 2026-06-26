import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";

const ADMIN_PW_KEY = "zen_admin_authed";

interface Review {
  id: number;
  name: string;
  pet: string;
  text: string;
  stars: number;
  photo: string | null;
  approved: boolean;
  createdAt: string;
}

interface Dog {
  id: number;
  name: string;
  emoji: string;
  service: string;
  antes: string;
  despues: string;
  combined?: string;
}

function apiHeaders(pw: string) {
  return { "x-admin-password": pw, "Content-Type": "application/json" };
}

function PawLogo() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="#7C3AED">
      <ellipse cx="6" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="10.5" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="15" cy="2.5" rx="1.8" ry="2.2" />
      <ellipse cx="19" cy="4.5" rx="2" ry="2.5" />
      <path d="M12 8c-3.8 0-7 2.8-7 6.5C5 17 7.2 19 12 19s7-2 7-4.5C19 10.8 15.8 8 12 8z" />
    </svg>
  );
}

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/dogs"), {
        headers: { "x-admin-password": pw },
      });
      if (res.ok) {
        sessionStorage.setItem(ADMIN_PW_KEY, pw);
        onLogin(pw);
      } else {
        setError("Contraseña incorrecta");
      }
    } catch {
      setError("Error de conexión con el servidor");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white", borderRadius: 24, padding: "48px 40px",
        boxShadow: "0 16px 64px rgba(124,58,237,0.15)",
        width: "100%", maxWidth: 400, textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <PawLogo />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>
          Zen Pet Spa
        </h1>
        <p style={{ fontSize: 14, color: "#9CA3AF", margin: "0 0 32px" }}>
          Panel de administración
        </p>

        <label style={{ display: "block", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          Contraseña
        </label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="••••••••"
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12,
            border: error ? "2px solid #EF4444" : "2px solid #EDE9FE",
            fontSize: 16, outline: "none", boxSizing: "border-box",
            marginBottom: 8,
            transition: "border-color 0.2s",
          }}
          onFocus={e => { if (!error) e.currentTarget.style.borderColor = "#7C3AED"; }}
          onBlur={e => { if (!error) e.currentTarget.style.borderColor = "#EDE9FE"; }}
        />
        {error && (
          <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px", textAlign: "left" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !pw}
          style={{
            width: "100%", marginTop: 16, padding: "14px",
            background: pw ? "#7C3AED" : "#C4B5FD",
            color: "white", border: "none", borderRadius: 12,
            fontSize: 16, fontWeight: 800, cursor: pw ? "pointer" : "default",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Verificando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

function DogEditor({
  dog,
  pw,
  onSaved,
  onDeleted,
}: {
  dog: Dog;
  pw: string;
  onSaved: (d: Dog) => void;
  onDeleted: (id: number) => void;
}) {
  const [name, setName] = useState(dog.name);
  const [emoji, setEmoji] = useState(dog.emoji);
  const [service, setService] = useState(dog.service);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"antes" | "despues" | "combined" | null>(null);
  const [localDog, setLocalDog] = useState(dog);
  const antesRef = useRef<HTMLInputElement>(null);
  const despuesRef = useRef<HTMLInputElement>(null);
  const combinedRef = useRef<HTMLInputElement>(null);

  const saveInfo = async () => {
    setSaving(true);
    const res = await fetch(`/api/dogs/${dog.id}`, {
      method: "PUT",
      headers: apiHeaders(pw),
      body: JSON.stringify({ name, emoji, service }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSaved(updated);
    }
    setSaving(false);
  };

  const uploadPhoto = async (field: "antes" | "despues" | "combined", file: File) => {
    setUploading(field);
    const formData = new FormData();
    formData.append(field, file);
    const res = await fetch(`/api/dogs/${dog.id}/upload`, {
      method: "POST",
      headers: { "x-admin-password": pw },
      body: formData,
    });
    if (res.ok) {
      const updated = await res.json();
      setLocalDog(updated);
      onSaved(updated);
    }
    setUploading(null);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${dog.name}?`)) return;
    await fetch(`/api/dogs/${dog.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pw },
    });
    onDeleted(dog.id);
  };

  const PhotoSlot = ({
    label,
    src,
    field,
    inputRef,
    fullWidth = false,
  }: {
    label: string;
    src: string;
    field: "antes" | "despues" | "combined";
    inputRef: React.RefObject<HTMLInputElement | null>;
    fullWidth?: boolean;
  }) => (
    <div style={{ flex: fullWidth ? "none" : 1, width: fullWidth ? "100%" : undefined }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          position: "relative",
          height: fullWidth ? "auto" : 130,
          minHeight: fullWidth ? 80 : undefined,
          borderRadius: 12, overflow: "hidden",
          border: "2px dashed #DDD6FE", cursor: "pointer",
          background: "#F5F0FF",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#DDD6FE"; }}
      >
        <img
          src={src}
          alt={label}
          style={{ width: "100%", height: fullWidth ? "auto" : "100%", objectFit: fullWidth ? undefined : "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: uploading === field ? "rgba(124,58,237,0.6)" : "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: uploading === field ? 1 : 0,
          transition: "opacity 0.2s",
        }}
          onMouseEnter={e => { if (uploading !== field) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          onMouseLeave={e => { if (uploading !== field) (e.currentTarget as HTMLElement).style.opacity = "0"; }}
        >
          {uploading === field ? (
            <p style={{ color: "white", fontSize: 13, fontWeight: 700 }}>Subiendo…</p>
          ) : (
            <p style={{ color: "white", fontSize: 12, fontWeight: 700, textAlign: "center", padding: "0 8px" }}>
              Cambiar imagen
            </p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) uploadPhoto(field, file);
          e.target.value = "";
        }}
      />
    </div>
  );

  return (
    <div style={{
      background: "white", borderRadius: 20,
      border: "1px solid #EDE9FE",
      boxShadow: "0 4px 16px rgba(124,58,237,0.08)",
      overflow: "hidden",
    }}>
      {/* Dog header */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{localDog.emoji || "🐾"}</span>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>{localDog.name}</span>
        </div>
        <button
          onClick={handleDelete}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#EF4444", fontSize: 12, fontWeight: 700, padding: "4px 8px",
            borderRadius: 6, transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
        >
          Eliminar
        </button>
      </div>

      {/* Photo slots */}
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Combined image (if present) */}
        {localDog.combined ? (
          <PhotoSlot
            label="📸 Imagen combinada (Antes + Después)"
            src={localDog.combined}
            field="combined"
            inputRef={combinedRef}
            fullWidth
          />
        ) : (
          <>
            {/* Upload combined button when none exists */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📸 Subir imagen combinada (Antes + Después)
              </p>
              <button
                onClick={() => combinedRef.current?.click()}
                style={{
                  width: "100%", padding: "14px",
                  border: "2px dashed #DDD6FE", borderRadius: 12,
                  background: "#F5F0FF", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: "#7C3AED",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED";
                  (e.currentTarget as HTMLElement).style.background = "#EDE9FE";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#DDD6FE";
                  (e.currentTarget as HTMLElement).style.background = "#F5F0FF";
                }}
              >
                {uploading === "combined" ? "Subiendo…" : "+ Subir foto antes y después"}
              </button>
              <input
                ref={combinedRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto("combined", file);
                  e.target.value = "";
                }}
              />
            </div>
            {/* Separate antes/despues slots as fallback */}
            <div style={{ display: "flex", gap: 10 }}>
              <PhotoSlot label="Antes" src={localDog.antes} field="antes" inputRef={antesRef} />
              <PhotoSlot label="Después" src={localDog.despues} field="despues" inputRef={despuesRef} />
            </div>
          </>
        )}
      </div>

      {/* Info fields */}
      <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ width: 72 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Emoji</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="✨" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Servicio</label>
          <input value={service} onChange={e => setService(e.target.value)} placeholder="Baño + Corte de pelo" style={inputStyle} />
        </div>
        <button
          onClick={saveInfo}
          disabled={saving}
          style={{
            marginTop: 4, padding: "10px",
            background: "#7C3AED", color: "white",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", marginTop: 4, padding: "8px 10px",
  borderRadius: 8, border: "1.5px solid #EDE9FE",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

function AddDogModal({ pw, onAdded, onClose }: { pw: string; onAdded: (d: Dog) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [service, setService] = useState("");
  const [saving, setSaving] = useState(false);
  const [combinedFile, setCombinedFile] = useState<File | null>(null);
  const [combinedPreview, setCombinedPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setCombinedFile(file);
    const reader = new FileReader();
    reader.onload = e => setCombinedPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch(apiUrl("/api/dogs"), {
      method: "POST",
      headers: apiHeaders(pw),
      body: JSON.stringify({ name: name.trim(), emoji: emoji.trim(), service: service.trim() }),
    });
    if (res.ok) {
      const dog = await res.json();
      if (combinedFile) {
        const formData = new FormData();
        formData.append("combined", combinedFile);
        await fetch(`/api/dogs/${dog.id}/upload`, {
          method: "POST",
          headers: { "x-admin-password": pw },
          body: formData,
        }).then(r => r.ok ? r.json() : dog).then(updated => onAdded(updated));
      } else {
        onAdded(dog);
      }
      onClose();
    }
    setSaving(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      overflowY: "auto",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form onSubmit={handleAdd} style={{
        background: "white", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 20px" }}>
          Agregar perro / gato
        </h2>

        {/* Combined photo upload */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          📸 Foto antes y después
        </p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            borderRadius: 12, overflow: "hidden",
            border: "2px dashed #DDD6FE", cursor: "pointer",
            background: "#F5F0FF", marginBottom: 16,
            minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED";
            (e.currentTarget as HTMLElement).style.background = "#EDE9FE";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#DDD6FE";
            (e.currentTarget as HTMLElement).style.background = "#F5F0FF";
          }}
        >
          {combinedPreview ? (
            <img src={combinedPreview} alt="preview" style={{ width: "100%", height: "auto", display: "block" }} />
          ) : (
            <p style={{ fontSize: 13, fontWeight: 600, color: "#7C3AED", margin: 0 }}>
              + Seleccionar imagen
            </p>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />

        <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nombre *</label>
        <input value={name} onChange={e => setName(e.target.value)} required style={{ ...inputStyle, marginBottom: 12 }} placeholder="Rocky" />

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Servicio</label>
            <input value={service} onChange={e => setService(e.target.value)} style={inputStyle} placeholder="Baño + Corte de pelo" />
          </div>
          <div style={{ width: 72 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Emoji</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} style={inputStyle} placeholder="✨" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: "12px", background: "#F3F4F6",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>Cancelar</button>
          <button type="submit" disabled={saving || !name.trim()} style={{
            flex: 2, padding: "12px", background: name.trim() ? "#7C3AED" : "#C4B5FD",
            color: "white", border: "none", borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: name.trim() ? "pointer" : "default",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Creando…" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Review card for admin ── */
function ReviewCard({
  review,
  pw,
  onApproved,
  onDeleted,
}: {
  review: Review;
  pw: string;
  onApproved: (r: Review) => void;
  onDeleted: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const approve = async () => {
    setLoading(true);
    const res = await fetch(`/api/reviews/${review.id}`, {
      method: "PUT",
      headers: { "x-admin-password": pw, "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    if (res.ok) onApproved(await res.json());
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar reseña de ${review.name}?`)) return;
    await fetch(`/api/reviews/${review.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pw },
    });
    onDeleted(review.id);
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < review.stars ? "★" : "☆").join("");

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: review.approved ? "1px solid #D1FAE5" : "1px solid #FDE68A",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      {review.photo && (
        <div style={{ height: 100, overflow: "hidden" }}>
          <img src={review.photo} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: "#111827", margin: 0 }}>{review.name}</p>
            {review.pet && <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>🐾 {review.pet}</p>}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
            background: review.approved ? "#D1FAE5" : "#FEF3C7",
            color: review.approved ? "#065F46" : "#92400E",
          }}>
            {review.approved ? "Aprobada" : "Pendiente"}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#F59E0B", margin: "0 0 4px", letterSpacing: 1 }}>{stars}</p>
        <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.5, margin: "0 0 10px" }}>{review.text}</p>
        <p style={{ fontSize: 10.5, color: "#D1D5DB", margin: "0 0 10px" }}>
          {new Date(review.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {!review.approved && (
            <button
              onClick={approve}
              disabled={loading}
              style={{
                flex: 1, padding: "8px", background: "#7C3AED", color: "white",
                border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: "pointer", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "…" : "✓ Aprobar"}
            </button>
          )}
          <button
            onClick={remove}
            style={{
              flex: 1, padding: "8px", background: "#FEF2F2", color: "#EF4444",
              border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

interface GalleryPhoto { id: number; url: string; createdAt: string; }

export default function Admin() {
  const [pw, setPw] = useState<string>(() => sessionStorage.getItem(ADMIN_PW_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [activeSection, setActiveSection] = useState<"mascotas" | "resenas" | "galeria">("mascotas");
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saved, setSaved] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchDogs = (password: string) => {
    setLoading(true);
    return fetch(apiUrl("/api/dogs"), { headers: { "x-admin-password": password } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDogs)
      .finally(() => setLoading(false));
  };

  const fetchReviews = (password: string) => {
    setLoadingReviews(true);
    return fetch(apiUrl("/api/reviews/all"), { headers: { "x-admin-password": password } })
      .then(r => r.ok ? r.json() : [])
      .then(setReviews)
      .finally(() => setLoadingReviews(false));
  };

  const fetchGallery = () => {
    setLoadingGallery(true);
    return fetch(apiUrl("/api/gallery"))
      .then(r => r.ok ? r.json() : [])
      .then(setGallery)
      .finally(() => setLoadingGallery(false));
  };

  const uploadGalleryPhoto = async (file: File) => {
    setUploadingGallery(true);
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(apiUrl("/api/gallery/upload"), {
      method: "POST",
      headers: { "x-admin-password": pw },
      body: formData,
    });
    if (res.ok) {
      const photo = await res.json();
      setGallery(prev => [...prev, photo]);
    }
    setUploadingGallery(false);
  };

  const deleteGalleryPhoto = async (id: number) => {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    const res = await fetch(`/api/gallery/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pw },
    });
    if (res.ok) setGallery(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    if (pw) {
      fetchDogs(pw)
        .then(() => { setAuthed(true); fetchReviews(pw); fetchGallery(); })
        .catch(() => { sessionStorage.removeItem(ADMIN_PW_KEY); });
    }
  }, [pw]);

  useEffect(() => {
    if (authed && activeSection === "resenas") fetchReviews(pw);
    if (authed && activeSection === "galeria") fetchGallery();
  }, [activeSection]);

  const handleLogin = (password: string) => {
    setPw(password);
    setAuthed(true);
    fetchDogs(password);
    fetchReviews(password);
    fetchGallery();
  };

  const handleSaved = (updated: Dog) => {
    setDogs(prev => prev.map(d => d.id === updated.id ? updated : d));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleDeleted = (id: number) => setDogs(prev => prev.filter(d => d.id !== id));
  const handleLogout = () => { sessionStorage.removeItem(ADMIN_PW_KEY); setAuthed(false); setPw(""); };

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  if (!authed && !loading) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)" }}>
      {/* Header */}
      <div style={{
        background: "white", borderBottom: "1px solid #EDE9FE",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 2px 12px rgba(124,58,237,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PawLogo />
          <div>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: 0 }}>Panel Admin</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Zen Pet Spa</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 700 }}>✓ Guardado</span>}
          <a href="/" style={{ fontSize: 13, color: "#7C3AED", fontWeight: 700, textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: "#F5F0FF" }}>
            Ver sitio
          </a>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "#6B7280", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "6px 12px" }}>
            Salir
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #EDE9FE", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0 }}>
          {([
            { id: "mascotas", label: "🐾 Mascotas" },
            { id: "resenas",  label: `💬 Reseñas${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}` },
            { id: "galeria",  label: "📸 Galería" },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: "14px 22px", border: "none", background: "none", cursor: "pointer",
                fontSize: 14, fontWeight: activeSection === tab.id ? 800 : 500,
                color: activeSection === tab.id ? "#7C3AED" : "#9CA3AF",
                borderBottom: `2px solid ${activeSection === tab.id ? "#7C3AED" : "transparent"}`,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── MASCOTAS section ── */}
        {activeSection === "mascotas" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Fotos Antes y Después</h2>
                <p style={{ fontSize: 14, color: "#9CA3AF", margin: "4px 0 0" }}>
                  Hacé click en cada foto para cambiarla. Los cambios se guardan inmediatamente.
                </p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: "12px 20px", background: "#7C3AED", color: "white",
                  border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800,
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                  transition: "transform 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                + Agregar mascota
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 80 }}><p style={{ color: "#9CA3AF", fontSize: 16 }}>Cargando…</p></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {dogs.map(dog => (
                  <DogEditor key={dog.id} dog={dog} pw={pw} onSaved={handleSaved} onDeleted={handleDeleted} />
                ))}
              </div>
            )}
            {dogs.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: 80 }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🐾</p>
                <p style={{ color: "#9CA3AF", fontSize: 16 }}>No hay mascotas todavía. ¡Agregá la primera!</p>
              </div>
            )}
          </>
        )}

        {/* ── GALERÍA section ── */}
        {activeSection === "galeria" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Galería de fotos</h2>
                <p style={{ fontSize: 14, color: "#9CA3AF", margin: "4px 0 0" }}>
                  Las fotos que aparecen en el tab "Galería" de la sección Resultados reales.
                </p>
              </div>
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                style={{
                  padding: "12px 20px", background: uploadingGallery ? "#C4B5FD" : "#7C3AED", color: "white",
                  border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800,
                  cursor: uploadingGallery ? "default" : "pointer",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                  transition: "transform 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => { if (!uploadingGallery) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                {uploadingGallery ? "Subiendo…" : "+ Agregar foto"}
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadGalleryPhoto(file);
                  e.target.value = "";
                }}
              />
            </div>

            {loadingGallery ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <p style={{ color: "#9CA3AF", fontSize: 16 }}>Cargando galería…</p>
              </div>
            ) : gallery.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>📸</p>
                <p style={{ color: "#9CA3AF", fontSize: 16 }}>No hay fotos en la galería. ¡Agregá la primera!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                {gallery.map(photo => (
                  <div
                    key={photo.id}
                    style={{
                      position: "relative", borderRadius: 14, overflow: "hidden",
                      border: "1px solid #EDE9FE", aspectRatio: "1",
                      boxShadow: "0 2px 10px rgba(124,58,237,0.08)",
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget.querySelector(".del-btn") as HTMLElement | null;
                      if (btn) btn.style.opacity = "1";
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget.querySelector(".del-btn") as HTMLElement | null;
                      if (btn) btn.style.opacity = "0";
                    }}
                  >
                    <img src={photo.url} alt="Galería" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button
                      className="del-btn"
                      onClick={() => deleteGalleryPhoto(photo.id)}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(239,68,68,0.9)", color: "white",
                        border: "none", borderRadius: 8, cursor: "pointer",
                        fontSize: 11, fontWeight: 700, padding: "5px 9px",
                        opacity: 0, transition: "opacity 0.15s",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── RESEÑAS section ── */}
        {activeSection === "resenas" && (
          <>
            {loadingReviews ? (
              <div style={{ textAlign: "center", padding: 80 }}><p style={{ color: "#9CA3AF", fontSize: 16 }}>Cargando reseñas…</p></div>
            ) : (
              <>
                {/* Pending */}
                {pendingReviews.length > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>Pendientes de aprobación</h3>
                      <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        {pendingReviews.length}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                      {pendingReviews.map(r => (
                        <ReviewCard
                          key={r.id}
                          review={r}
                          pw={pw}
                          onApproved={updated => setReviews(prev => prev.map(x => x.id === updated.id ? updated : x))}
                          onDeleted={id => setReviews(prev => prev.filter(x => x.id !== id))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                    Reseñas aprobadas ({approvedReviews.length})
                  </h3>
                  {approvedReviews.length === 0 ? (
                    <p style={{ color: "#9CA3AF", fontSize: 14 }}>No hay reseñas aprobadas todavía.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                      {approvedReviews.map(r => (
                        <ReviewCard
                          key={r.id}
                          review={r}
                          pw={pw}
                          onApproved={updated => setReviews(prev => prev.map(x => x.id === updated.id ? updated : x))}
                          onDeleted={id => setReviews(prev => prev.filter(x => x.id !== id))}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {reviews.length === 0 && (
                  <div style={{ textAlign: "center", padding: 80 }}>
                    <p style={{ fontSize: 48, marginBottom: 12 }}>💬</p>
                    <p style={{ color: "#9CA3AF", fontSize: 16 }}>Todavía no hay reseñas enviadas por los clientes.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <AddDogModal
          pw={pw}
          onAdded={d => { setDogs(prev => [...prev, d]); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
