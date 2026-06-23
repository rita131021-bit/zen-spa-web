import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";

interface Props {
  serviceId: string;
  price: string;
  priceNote?: string;
  featured?: boolean;
  onSaved?: (newPrice: string, newNote: string) => void;
}

export default function EditablePrice({ serviceId, price, priceNote = "", featured = false, onSaved }: Props) {
  const { isAdmin, password } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(price);
  const [draftNote, setDraftNote] = useState(priceNote);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftPrice(price); setDraftNote(priceNote); }, [price, priceNote]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const isEmpty = !price;

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/prices/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ price: draftPrice.trim(), priceNote: draftNote.trim() }),
      });
      onSaved?.(draftPrice.trim(), draftNote.trim());
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() {
    setDraftPrice(price);
    setDraftNote(priceNote);
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 6, background: featured ? "#FFFBEB" : "#F5F0FF", borderRadius: 12, padding: "8px 12px", minWidth: 160 }}>
        <input
          ref={inputRef}
          value={draftPrice}
          onChange={e => setDraftPrice(e.target.value)}
          placeholder="ej: $8.500"
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          style={{ border: "1.5px solid #a78bfa", borderRadius: 8, padding: "5px 10px", fontSize: 15, fontWeight: 800, color: featured ? "#D97706" : "#7C3AED", outline: "none", background: "white", width: "100%" }}
        />
        <input
          value={draftNote}
          onChange={e => setDraftNote(e.target.value)}
          placeholder="ej: por sesión"
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#9CA3AF", outline: "none", background: "white", width: "100%" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "5px 0", borderRadius: 7, border: "none", background: "#7C3AED", color: "white", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "…" : "✓ Guardar"}
          </button>
          <button onClick={cancel}
            style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "5px 0", borderRadius: 7, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer" }}>
            ✕ Cancelar
          </button>
        </div>
      </div>
    );
  }

  /* ── Filled price ── */
  if (!isEmpty) {
    return (
      <div
        onClick={isAdmin ? () => setEditing(true) : undefined}
        title={isAdmin ? "Clic para editar precio" : undefined}
        style={{
          display: "inline-flex", alignItems: "baseline", gap: 5, position: "relative",
          background: flash ? "#D1FAE5" : (featured ? "linear-gradient(135deg,#FEF9EE,#FEF3C7)" : "#EDE9FE"),
          borderRadius: 10, padding: "6px 14px",
          cursor: isAdmin ? "pointer" : "default",
          border: isAdmin ? "1.5px dashed #a78bfa" : "none",
          transition: "background 0.3s",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 900, color: featured ? "#D97706" : "#7C3AED" }}>{price}</span>
        {priceNote && <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>{priceNote}</span>}
        {isAdmin && (
          <span style={{ position: "absolute", top: -7, right: -7, fontSize: 10, background: "#7C3AED", color: "white", borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</span>
        )}
      </div>
    );
  }

  /* ── Empty price ── */
  return (
    <div
      onClick={isAdmin ? () => setEditing(true) : undefined}
      title={isAdmin ? "Clic para agregar precio" : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, position: "relative",
        background: isAdmin ? "#F5F0FF" : "#F9FAFB",
        border: isAdmin ? "1.5px dashed #a78bfa" : "1px dashed #D1D5DB",
        borderRadius: 10, padding: "6px 14px",
        cursor: isAdmin ? "pointer" : "default",
      }}
    >
      {isAdmin ? (
        <>
          <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700 }}>+ Agregar precio</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>Precio:</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>Consultar</span>
        </>
      )}
    </div>
  );
}
