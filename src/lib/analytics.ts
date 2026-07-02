export type BusinessEventName =
  | "reserva_iniciada"
  | "reserva_confirmada"
  | "chat_online_iniciado"
  | "click_whatsapp"
  | "resena_enviada"
  | "pago_iniciado"
  | "pago_completado"
  | "click_telefono"
  | "click_google_maps"
  | "formulario_enviado";

declare global {
  interface Window {
    zenTrack?: (eventName: string, params?: Record<string, unknown>) => void;
    dataLayer?: Array<Record<string, unknown> | IArguments>;
  }
}

export function trackEvent(eventName: BusinessEventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.zenTrack === "function") {
    window.zenTrack(eventName, params);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}
