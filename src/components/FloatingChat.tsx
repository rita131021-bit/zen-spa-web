import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "@/lib/api";

const WA_PHONE   = "5491100000000"; // Format: 54 9 (area code) (number) — no +, no spaces
const WA_MESSAGE = "Hola 🌸 Quiero consultar sobre los servicios de Zen Spa para Mascotas.";
const WA_URL     = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;
const VISITOR_STORAGE_KEY = "zen-chat-visitor-id";
const CLIENT_STORAGE_KEY = "zen-chat-cliente-id";
const CLIENT_NAME_STORAGE_KEY = "zen-chat-cliente-nombre";
const CLIENT_WHATSAPP_STORAGE_KEY = "zen-chat-cliente-whatsapp";
const SOCKET_FALLBACK_URL = "https://zen-spa-backend-production-df4d.up.railway.app";

const getSocketUrl = () => {
  const configuredUrl = (
    import.meta.env.VITE_SOCKET_URL ??
    import.meta.env.VITE_API_URL ??
    SOCKET_FALLBACK_URL
  ).replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app")) {
    return window.location.origin;
  }

  return configuredUrl;
};

type ChatMessage = {
  id: number | string;
  cliente_id: number | string;
  autor_tipo: "cliente" | "admin";
  autor_nombre: string;
  mensaje: string;
  creado_en: string;
};

type ClienteResponse = {
  id?: number | string;
  cliente?: {
    id?: number | string;
  };
};

type ChatStep = "name" | "whatsapp" | "ready";

type VisitorProfile = {
  name: string;
  whatsapp: string;
};

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

/* ─── Main component ─── */
export default function FloatingChat() {
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse]     = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [onboardingStep, setOnboardingStep] = useState<ChatStep>("name");
  const [visitorName, setVisitorName] = useState("");
  const [isTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const visitorIdRef = useRef("");
  const clienteIdRef = useRef<string>("");
  const visitorNameRef = useRef("Visitante Web");

  const statusLabel = useMemo(() => {
    if (onboardingStep === "name") return "Decinos tu nombre";
    if (onboardingStep === "whatsapp") return "Dejanos tu WhatsApp";
    if (registering) return "Preparando chat...";
    if (loadingHistory) return "Cargando mensajes...";
    if (chatReady) return "En línea · Respondemos rápido";
    return "Conectando...";
  }, [chatReady, loadingHistory, onboardingStep, registering]);

  const introMessage = useMemo(() => {
    if (onboardingStep === "name") return "¡Hola! 🌸 Para poder ayudarte mejor, decinos tu nombre.";
    if (onboardingStep === "whatsapp") {
      return "Gracias" + (visitorName ? ", " + visitorName : "") + ". Ahora dejanos tu WhatsApp para que Romina sepa a quién responder.";
    }
    return "¡Hola" + (visitorName ? ", " + visitorName : "") + "! 🌸 ¿En qué podemos ayudarte hoy?";
  }, [onboardingStep, visitorName]);

  const inputPlaceholder =
    onboardingStep === "name"
      ? "Tu nombre..."
      : onboardingStep === "whatsapp"
        ? "Tu WhatsApp..."
        : "Escribí tu mensaje...";

  const canSend = Boolean(draft.trim()) && !sending && !registering;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOrCreateVisitorId = () => {
    if (visitorIdRef.current) return visitorIdRef.current;
    const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (stored) {
      visitorIdRef.current = stored;
      return stored;
    }
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VISITOR_STORAGE_KEY, generated);
    visitorIdRef.current = generated;
    return generated;
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((current) => {
      const exists = current.some((item) => String(item.id) === String(message.id));
      if (exists) return current;
      return [...current, message];
    });
  };

  const loadStoredProfile = () => {
    const storedName = window.localStorage.getItem(CLIENT_NAME_STORAGE_KEY)?.trim() || "";
    const storedWhatsapp = window.localStorage.getItem(CLIENT_WHATSAPP_STORAGE_KEY)?.trim() || "";
    if (storedName) {
      setVisitorName(storedName);
      visitorNameRef.current = storedName;
    }
    return { storedName, storedWhatsapp };
  };

  const ensureClienteId = async (profile: VisitorProfile) => {
    if (clienteIdRef.current) return clienteIdRef.current;
    const storedClientId = window.localStorage.getItem(CLIENT_STORAGE_KEY);
    if (storedClientId) {
      clienteIdRef.current = storedClientId;
      setOnboardingStep("ready");
      loadStoredProfile();
      return storedClientId;
    }

    setRegistering(true);
    setErrorMessage("");
    const visitorId = getOrCreateVisitorId();
    const response = await fetch(apiUrl("/api/clientes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: profile.name,
        whatsapp: profile.whatsapp,
        telefono: profile.whatsapp,
        notas: `Registrado desde chat web (${visitorId})`,
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo registrar el visitante.");
    }

    const data = (await response.json()) as ClienteResponse;
    const clienteId = data.id ?? data.cliente?.id;
    if (!clienteId) {
      throw new Error("La API no devolvió un cliente válido.");
    }

    const normalizedId = String(clienteId);
    window.localStorage.setItem(CLIENT_STORAGE_KEY, normalizedId);
    window.localStorage.setItem(CLIENT_NAME_STORAGE_KEY, profile.name);
    window.localStorage.setItem(CLIENT_WHATSAPP_STORAGE_KEY, profile.whatsapp);
    clienteIdRef.current = normalizedId;
    visitorNameRef.current = profile.name;
    setVisitorName(profile.name);
    setOnboardingStep("ready");
    return normalizedId;
  };

  const loadHistory = async (clienteId: string) => {
    setLoadingHistory(true);
    setErrorMessage("");
    try {
      const response = await fetch(apiUrl(`/api/chat/${clienteId}`));
      if (!response.ok) {
        throw new Error("No se pudo cargar el historial.");
      }
      const data = (await response.json()) as ChatMessage[];
      const normalizedMessages = Array.isArray(data) ? data : [];
      setMessages(normalizedMessages);
      return normalizedMessages;
    } finally {
      setLoadingHistory(false);
    }
  };

  const connectSocket = (clienteId: string) => {
    const existingSocket = socketRef.current;

    if (existingSocket) {
      if (!existingSocket.connected) {
        existingSocket.connect();
      }
      return existingSocket;
    }

    const socket = io(getSocketUrl(), {
      path: "/socket.io/",
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    const joinChatRoom = () => {
      socket.emit("join", { clienteId, role: "cliente" });
      setChatReady(true);
      setErrorMessage("");
    };

    socket.on("connect", joinChatRoom);
    socket.io.on("reconnect", joinChatRoom);

    socket.on("disconnect", () => {
      setChatReady(false);
    });

    socket.on("connect_error", () => {
      setChatReady(false);
      setErrorMessage("Reconectando chat...");
    });

    socket.on("mensaje:nuevo", (message: ChatMessage) => {
      if (String(message.cliente_id) !== String(clienteIdRef.current)) return;
      appendMessage(message);
    });

    socketRef.current = socket;
    return socket;
  };

  const sendMessageByApi = async (clienteId: string, messageText: string) => {
    const response = await fetch(apiUrl(`/api/chat/${clienteId}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensaje: messageText,
        autor_tipo: "cliente",
        autor_nombre: visitorNameRef.current || "Visitante Web",
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar el mensaje.");
    }

    const data = (await response.json()) as ChatMessage;
    appendMessage(data);
    return data;
  };

  const initializeChat = async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      const storedClientId = window.localStorage.getItem(CLIENT_STORAGE_KEY);
      if (!storedClientId) {
        loadStoredProfile();
        setOnboardingStep("name");
        setChatReady(false);
        return;
      }

      clienteIdRef.current = storedClientId;
      const storedProfile = loadStoredProfile();
      setOnboardingStep("ready");
      const history = await loadHistory(storedClientId);
      if ((history ?? []).length === 0) {
        const name = storedProfile.storedName || visitorNameRef.current || "Visitante Web";
        const whatsapp = storedProfile.storedWhatsapp;
        await sendMessageByApi(
          storedClientId,
          `Hola, soy ${name}${whatsapp ? `. Mi WhatsApp es ${whatsapp}` : ""}.`,
        );
        await loadHistory(storedClientId);
      }
      connectSocket(storedClientId);
    } catch (error) {
      initializedRef.current = false;
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar el chat.");
    } finally {
      setRegistering(false);
    }
  };

  const completeVisitorProfile = async (whatsapp: string) => {
    const name = visitorName.trim();
    if (!name) {
      setOnboardingStep("name");
      setErrorMessage("Primero necesitamos tu nombre.");
      return;
    }

    setSending(true);
    setRegistering(true);
    setErrorMessage("");
    try {
      const clienteId = await ensureClienteId({ name, whatsapp });
      const history = await loadHistory(clienteId);
      if ((history ?? []).length === 0) {
        await sendMessageByApi(clienteId, `Hola, soy ${name}. Mi WhatsApp es ${whatsapp}.`);
        await loadHistory(clienteId);
      }
      connectSocket(clienteId);
      setDraft("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar el visitante.");
    } finally {
      setSending(false);
      setRegistering(false);
    }
  };

  const handleSend = async () => {
    const messageText = draft.trim();
    if (!messageText || sending) return;

    if (onboardingStep === "name") {
      if (messageText.length < 2) {
        setErrorMessage("Escribí tu nombre para que podamos identificarte.");
        return;
      }
      setVisitorName(messageText);
      visitorNameRef.current = messageText;
      window.localStorage.setItem(CLIENT_NAME_STORAGE_KEY, messageText);
      setOnboardingStep("whatsapp");
      setErrorMessage("");
      setDraft("");
      return;
    }

    if (onboardingStep === "whatsapp") {
      await completeVisitorProfile(messageText);
      return;
    }

    const socket = socketRef.current;
    const clienteId = clienteIdRef.current;
    if (!clienteId) return;

    setSending(true);
    setErrorMessage("");

    try {
      let sent = false;

      if (socket) {
        if (!socket.connected) {
          socket.connect();
        }

        if (socket.connected) {
          try {
            await new Promise<void>((resolve, reject) => {
              const timeout = window.setTimeout(() => {
                reject(new Error("Socket sin confirmación."));
              }, 5000);

              socket.emit(
                "mensaje:enviar",
                {
                  cliente_id: clienteId,
                  mensaje: messageText,
                  autor_tipo: "cliente",
                  autor_nombre: visitorNameRef.current || "Visitante Web",
                },
                (response: { ok: boolean; data?: ChatMessage; error?: string }) => {
                  window.clearTimeout(timeout);
                  if (!response?.ok || !response.data) {
                    reject(new Error(response?.error || "No se pudo enviar el mensaje."));
                    return;
                  }
                  appendMessage(response.data);
                  sent = true;
                  resolve();
                },
              );
            });
          } catch {
            sent = false;
          }
        }
      }

      if (!sent) {
        await sendMessageByApi(clienteId, messageText);
      }

      await loadHistory(clienteId);
      setDraft("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  /* Appear after 2s, stop pulsing after 6s */
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2000);
    const t2 = setTimeout(() => setPulse(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    getOrCreateVisitorId();
  }, []);

  useEffect(() => {
    if (open) {
      void initializeChat();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
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
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)" }}>{statusLabel}</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", color: "white" }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ padding: "14px 14px 12px" }}>
            <div style={{
              background: "#FAF7FF",
              border: "1px solid #EDE9FE",
              borderRadius: 18,
              padding: "12px 12px 10px",
            }}>
              <div style={{
                height: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingRight: 4,
              }}>
                <div style={{
                  background: "#F5F0FF",
                  border: "1px solid #EDE9FE",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "11px 14px",
                  display: "inline-block",
                  maxWidth: "90%",
                  alignSelf: "flex-start",
                }}>
                  <p style={{ fontSize: 13, color: "#4C1D95", margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                    {introMessage}
                  </p>
                </div>

                {messages.map((message) => {
                  const isVisitor = message.autor_tipo === "cliente";
                  return (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: isVisitor ? "flex-end" : "flex-start",
                        maxWidth: "88%",
                      }}
                    >
                      <div
                        style={{
                          background: isVisitor ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F3F4F6",
                          color: isVisitor ? "white" : "#374151",
                          border: isVisitor ? "none" : "1px solid #E5E7EB",
                          borderRadius: isVisitor ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                          padding: "10px 12px",
                          boxShadow: isVisitor ? "0 6px 18px rgba(124,58,237,0.18)" : "none",
                        }}
                      >
                        <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.mensaje}</p>
                      </div>
                      <p style={{
                        fontSize: 10.5,
                        color: "#9CA3AF",
                        margin: "4px 4px 0",
                        textAlign: isVisitor ? "right" : "left",
                      }}>
                        {message.autor_nombre}
                      </p>
                    </div>
                  );
                })}

                {(loadingHistory || registering) && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "white",
                      border: "1px solid #EDE9FE",
                      borderRadius: 999,
                      padding: "8px 12px",
                      color: "#7C3AED",
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      {registering ? "Registrando visitante..." : "Cargando conversación..."}
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div style={{ alignSelf: "flex-start" }}>
                    <div style={{
                      background: "#F3F4F6",
                      border: "1px solid #E5E7EB",
                      borderRadius: "4px 18px 18px 18px",
                      padding: "10px 12px",
                    }}>
                      <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0 }}>Escribiendo...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {errorMessage && (
                <div style={{
                  marginTop: 10,
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  borderRadius: 12,
                  padding: "9px 11px",
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {errorMessage}
                </div>
              )}
            </div>

            <div style={{
              marginTop: 10,
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
            }}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={inputPlaceholder}
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  minHeight: 44,
                  maxHeight: 96,
                  borderRadius: 14,
                  border: "1.5px solid #DDD6FE",
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "#1F2937",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={!canSend}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  border: "none",
                  cursor: !canSend ? "not-allowed" : "pointer",
                  background: !canSend ? "#DDD6FE" : "#7C3AED",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: !canSend ? "none" : "0 8px 20px rgba(124,58,237,0.28)",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {sending ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={17} />}
              </button>
            </div>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#25D366",
                color: "white",
                borderRadius: 14,
                padding: "10px 12px",
                textDecoration: "none",
                boxShadow: "0 3px 14px rgba(37,211,102,0.22)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#20BD5C"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#25D366"; }}
            >
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WhatsAppIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12.5, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>¿Preferís WhatsApp?</p>
                <p style={{ fontSize: 11, margin: 0, opacity: 0.88 }}>Abrí una conversación directa</p>
              </div>
            </a>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
