import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminFloatingButton() {
  const { isAdmin, activate, deactivate } = useAdmin();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await activate(pw);
    setLoading(false);
    if (ok) { setOpen(false); setPw(""); }
    else setError("Clave incorrecta");
  }

  return (
    <>
      <button
        onClick={() => isAdmin ? deactivate() : setOpen(true)}
        title={isAdmin ? "Salir del modo admin" : "Modo admin"}
        style={{
          position: "fixed", bottom: 76, right: 20, zIndex: 9999,
          width: 44, height: 44, borderRadius: "50%",
          background: isAdmin ? "#7C3AED" : "#1F2937",
          color: "white", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          fontSize: 18,
          transition: "background 0.2s",
        }}
      >
        {isAdmin ? "✏️" : "🔐"}
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "32px 28px", width: 320, boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <h3 style={{ fontWeight: 800, fontSize: 17, color: "#111827", marginBottom: 6 }}>Modo Admin</h3>
            <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 20 }}>Ingresá la clave para editar precios directamente en las tarjetas.</p>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password"
                placeholder="Clave de administrador"
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoFocus
                style={{ border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}
              />
              {error && <p style={{ color: "#EF4444", fontSize: 12, margin: 0 }}>{error}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => { setOpen(false); setPw(""); setError(""); }}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#6B7280" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#7C3AED", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
