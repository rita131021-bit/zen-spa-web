import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Send, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "@/lib/api";

const VISITOR_STORAGE_KEY = "zen-chat-visitor-id";
const CLIENT_STORAGE_KEY = "zen-chat-cliente-id";
const CLIENT_NAME_STORAGE_KEY = "zen-chat-cliente-nombre";
const CLIENT_WHATSAPP_STORAGE_KEY = "zen-chat-cliente-whatsapp";
const SOCKET_FALLBACK_URL = "https://zen-spa-backend-production-df4d.up.railway.app";

const getStoredValue = (key: string) => {
  try {
    return typeof window !== "undefined" ? window.localStorage?.getItem(key) : null;
  } catch {
    return null;
  }
};

const setStoredValue = (key: string, value: string) => {
  try {
    if (typeof window !== "undefined") window.localStorage?.setItem(key, value);
  } catch {
    // Storage can be blocked in private or embedded browsers; chat must still work.
  }
};

const removeStoredValue = (key: string) => {
  try {
    if (typeof window !== "undefined") window.localStorage?.removeItem(key);
  } catch {
    // Storage can be blocked in private or embedded browsers; chat must still work.
  }
};

const getSocketUrl = () => {
  const configuredUrl = (
    import.meta.env.VITE_SOCKET_URL ??
    import.meta.env.VITE_API_URL ??
    SOCKET_FALLBACK_URL
  ).replace(/\/$/, "");

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
  const [visitorWhatsapp, setVisitorWhatsapp] = useState("");
  const [isTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const registrationStartedRef = useRef(false);
  const visitorIdRef = useRef("");
  const clienteIdRef = useRef<string>("");
  const visitorNameRef = useRef("");

  const statusLabel = useMemo(() => {
    if (onboardingStep !== "ready") return "Registrá tus datos";
    if (registering) return "Preparando chat...";
    if (loadingHistory) return "Cargando mensajes...";
    if (chatReady) return "En línea · Respondemos rápido";
    return "Conectando...";
  }, [chatReady, loadingHistory, onboardingStep, registering]);

  const introMessage = useMemo(() => {
    if (onboardingStep !== "ready") {
      return "¡Hola! 🌸 Dejanos tu nombre y WhatsApp para abrir tu conversación.";
    }
    return "¡Hola" + (visitorName ? ", " + visitorName : "") + "! 🌸 ¿En qué podemos ayudarte hoy?";
  }, [onboardingStep, visitorName]);


  const canSend = onboardingStep === "ready" && Boolean(draft.trim()) && !sending && !registering;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, "");

  const canRegister =
    visitorName.trim().length >= 2 && normalizePhone(visitorWhatsapp).length >= 6 && !sending && !registering;

  const findExistingClienteId = async (whatsapp: string) => {
    const target = normalizePhone(whatsapp);
    if (!target) return "";

    const response = await fetch(apiUrl("/api/clientes"));
    if (!response.ok) return "";

    const clientes = (await response.json()) as Array<{
      id?: number | string;
      whatsapp?: string;
      telefono?: string;
    }>;

    const match = clientes.find((cliente) => {
      const storedWhatsapp = normalizePhone(cliente.whatsapp || "");
      const storedTelefono = normalizePhone(cliente.telefono || "");
      return storedWhatsapp === target || storedTelefono === target;
    });

    return match?.id ? String(match.id) : "";
  };

  const getOrCreateVisitorId = () => {
    if (visitorIdRef.current) return visitorIdRef.current;
    const stored = getStoredValue(VISITOR_STORAGE_KEY);
    if (stored) {
      visitorIdRef.current = stored;
      return stored;
    }
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setStoredValue(VISITOR_STORAGE_KEY, generated);
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
    const storedNameRaw = getStoredValue(CLIENT_NAME_STORAGE_KEY)?.trim() || "";
    const storedName = storedNameRaw && storedNameRaw !== "Visitante Web" ? storedNameRaw : "";
    const storedWhatsapp = getStoredValue(CLIENT_WHATSAPP_STORAGE_KEY)?.trim() || "";
    setVisitorName(storedName);
    setVisitorWhatsapp(storedWhatsapp);
    visitorNameRef.current = storedName;
    return { storedName, storedWhatsapp };
  };

  const ensureClienteId = async (profile: VisitorProfile) => {
    if (clienteIdRef.current) return clienteIdRef.current;
    const storedClientId = getStoredValue(CLIENT_STORAGE_KEY);
    if (storedClientId && profile.name && profile.name !== "Visitante Web" && profile.whatsapp) {
      clienteIdRef.current = storedClientId;
      setOnboardingStep("ready");
      return storedClientId;
    }

    if (storedClientId) {
      removeStoredValue(CLIENT_STORAGE_KEY);
      clienteIdRef.current = "";
    }

    setRegistering(true);
    setErrorMessage("");

    const existingClienteId = await findExistingClienteId(profile.whatsapp);
    if (existingClienteId) {
      setStoredValue(CLIENT_STORAGE_KEY, existingClienteId);
      setStoredValue(CLIENT_NAME_STORAGE_KEY, profile.name);
      setStoredValue(CLIENT_WHATSAPP_STORAGE_KEY, profile.whatsapp);
      clienteIdRef.current = existingClienteId;
      visitorNameRef.current = profile.name;
      setVisitorName(profile.name);
      setOnboardingStep("ready");
      return existingClienteId;
    }

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
    setStoredValue(CLIENT_STORAGE_KEY, normalizedId);
    setStoredValue(CLIENT_NAME_STORAGE_KEY, profile.name);
    setStoredValue(CLIENT_WHATSAPP_STORAGE_KEY, profile.whatsapp);
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
        autor_nombre: visitorNameRef.current || visitorName || "Cliente Web",
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
      const storedClientId = getStoredValue(CLIENT_STORAGE_KEY);
      const storedProfile = loadStoredProfile();
      if (!storedClientId || !storedProfile.storedName || !storedProfile.storedWhatsapp) {
        removeStoredValue(CLIENT_STORAGE_KEY);
        clienteIdRef.current = "";
        setOnboardingStep("name");
        setChatReady(false);
        return;
      }

      clienteIdRef.current = storedClientId;
      setOnboardingStep("ready");
      const history = await loadHistory(storedClientId);
      if ((history ?? []).length === 0) {
        const name = storedProfile.storedName || visitorNameRef.current || "Cliente Web";
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
    const name = visitorNameRef.current || visitorName.trim() || getStoredValue(CLIENT_NAME_STORAGE_KEY)?.trim() || "";
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

  const submitVisitorRegistration = async () => {
    try {
      const name = visitorName.trim();
      const whatsapp = visitorWhatsapp.trim();

      if (name.length < 2) {
        setErrorMessage("Escribí tu nombre para que podamos identificarte.");
        return;
      }

      if (normalizePhone(whatsapp).length < 6) {
        setErrorMessage("Escribí un WhatsApp válido para poder responderte.");
        return;
      }

      if (registrationStartedRef.current || sending || registering) return;
      registrationStartedRef.current = true;
      visitorNameRef.current = name;
      setVisitorName(name);
      setStoredValue(CLIENT_NAME_STORAGE_KEY, name);
      setStoredValue(CLIENT_WHATSAPP_STORAGE_KEY, whatsapp);
      removeStoredValue(CLIENT_STORAGE_KEY);
      clienteIdRef.current = "";
      await completeVisitorProfile(whatsapp);
    } catch (error) {
      registrationStartedRef.current = false;
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar el chat.");
      setSending(false);
      setRegistering(false);
    }
  };

  const handleVisitorRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitVisitorRegistration();
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
      setStoredValue(CLIENT_NAME_STORAGE_KEY, messageText);
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
                  autor_nombre: visitorNameRef.current || visitorName || "Cliente Web",
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

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  useEffect(() => {
    if (onboardingStep === "ready" || !canRegister || registrationStartedRef.current) return;
    const timer = window.setTimeout(() => {
      void submitVisitorRegistration();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [visitorName, visitorWhatsapp, canRegister, onboardingStep]);

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

            {onboardingStep !== "ready" ? (
              <form
                onSubmit={handleVisitorRegistration}
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  value={visitorName}
                  onChange={(event) => setVisitorName(event.target.value)}
                  placeholder="Nombre y apellido"
                  style={{
                    width: "100%",
                    minHeight: 44,
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
                <input
                  type="tel"
                  inputMode="tel"
                  value={visitorWhatsapp}
                  onChange={(event) => setVisitorWhatsapp(event.target.value)}
                  placeholder="WhatsApp"
                  style={{
                    width: "100%",
                    minHeight: 44,
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
                  type="button"
                  onPointerDown={(event) => { event.preventDefault(); void submitVisitorRegistration(); }}
                  onMouseDown={(event) => { event.preventDefault(); void submitVisitorRegistration(); }}
                  onClick={() => { void submitVisitorRegistration(); }}
                  disabled={!canRegister}
                  style={{
                    minHeight: 44,
                    borderRadius: 14,
                    border: "none",
                    cursor: !canRegister ? "not-allowed" : "pointer",
                    background: !canRegister ? "#DDD6FE" : "#7C3AED",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    boxShadow: !canRegister ? "none" : "0 8px 20px rgba(124,58,237,0.28)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {registering ? "Abriendo chat..." : canRegister ? "Abriendo automáticamente..." : "Completá tus datos"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleChatSubmit}
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Escribí tu mensaje..."
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
                  type="button"
                  onPointerDown={(event) => { event.preventDefault(); void handleSend(); }}
                  onMouseDown={(event) => { event.preventDefault(); void handleSend(); }}
                  onClick={() => { void handleSend(); }}
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
              </form>
            )}
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
            background: "rgba(124,58,237,0.22)",
            animation: "chat-pulse 1.6s ease-out infinite",
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
            background: "#7C3AED",
            color: "white",
            boxShadow: "0 6px 24px rgba(124,58,237,0.4)",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: open ? "rotate(0deg) scale(1)" : "rotate(0deg) scale(1)",
          }}
        >
          <div style={{
            transition: "all 0.22s ease",
            transform: open ? "rotate(90deg) scale(0.85)" : "rotate(0deg) scale(1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {open ? <X size={22} /> : <Send size={24} />}
          </div>
        </button>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes chat-pulse {
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
