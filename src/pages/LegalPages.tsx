import { useState } from "react";

const updatedAt = "2 de julio de 2026";

type LegalType = "privacidad" | "terminos" | "cookies" | "aviso";

const pages: Record<LegalType, { title: string; description: string; sections: Array<{ heading: string; body: string[] }> }> = {
  privacidad: {
    title: "Politica de Privacidad",
    description: "Como Zen Spa para Mascotas trata los datos enviados por formularios, reservas, chat online y WhatsApp.",
    sections: [
      { heading: "Responsable", body: ["Zen Spa para Mascotas utiliza los datos personales que las personas envian voluntariamente para responder consultas, gestionar reservas, organizar servicios para mascotas y mejorar la atencion."] },
      { heading: "Datos que podemos solicitar", body: ["Nombre, telefono, WhatsApp, email, datos de la mascota, servicio elegido, fecha, hora, observaciones, mensajes del chat online, resenas y archivos o fotos enviados voluntariamente."] },
      { heading: "Finalidad", body: ["Usamos la informacion para coordinar turnos, responder consultas, enviar confirmaciones por WhatsApp o email, administrar fidelidad, publicar resenas aprobadas y mejorar la experiencia del sitio."] },
      { heading: "Herramientas externas", body: ["El sitio puede integrar WhatsApp, Google Maps, Google Analytics, Google Tag Manager, servicios de hosting, Socket.io para chat online y MercadoPago cuando se habiliten pagos. Cada proveedor puede tratar datos segun sus propias politicas."] },
      { heading: "Conservacion y derechos", body: ["Conservamos los datos durante el tiempo necesario para prestar el servicio, cumplir obligaciones y mantener historial de atencion. Las personas pueden solicitar acceso, correccion o eliminacion escribiendo por los canales de contacto de Zen Spa para Mascotas."] }
    ]
  },
  terminos: {
    title: "Terminos y Condiciones",
    description: "Condiciones de uso del sitio, reservas online, servicios y comunicaciones.",
    sections: [
      { heading: "Uso del sitio", body: ["El sitio permite conocer servicios, solicitar reservas, enviar consultas, usar el chat online, compartir resenas y contactar por WhatsApp. El uso debe ser respetuoso y con informacion verdadera."] },
      { heading: "Reservas", body: ["Las reservas online quedan sujetas a disponibilidad real del local, profesionales, horarios y confirmacion de Zen Spa para Mascotas. Una solicitud enviada desde la web no implica confirmacion automatica hasta recibir respuesta del equipo."] },
      { heading: "Precios y servicios", body: ["Los precios publicados pueden actualizarse. Ante dudas, promociones, gift cards o servicios especiales, Zen Spa para Mascotas podra confirmar el importe final antes de realizar el servicio."] },
      { heading: "Pagos", body: ["Cuando MercadoPago u otro medio se integre, el pago se procesara mediante proveedores externos seguros. Zen Spa para Mascotas no almacena datos completos de tarjetas."] },
      { heading: "Contenido de usuarios", body: ["Las resenas, fotos y mensajes enviados por clientes pueden ser moderados. Solo se publicaran resenas aprobadas y el contenido inapropiado podra eliminarse."] }
    ]
  },
  cookies: {
    title: "Politica de Cookies",
    description: "Uso de cookies y tecnologias similares en el sitio.",
    sections: [
      { heading: "Que son", body: ["Las cookies y tecnologias similares ayudan a recordar preferencias, mejorar el funcionamiento del sitio, medir visitas y entender que secciones son mas utiles."] },
      { heading: "Tipos de cookies", body: ["Podemos usar cookies necesarias para que el sitio funcione, cookies de preferencias, medicion con Google Analytics y etiquetas de Google Tag Manager cuando se configuren."] },
      { heading: "Consentimiento", body: ["El banner permite aceptar o rechazar cookies no esenciales. Las cookies tecnicas necesarias pueden seguir funcionando porque permiten prestar el servicio solicitado."] },
      { heading: "Terceros", body: ["Google Maps, WhatsApp, Google Analytics, Tag Manager, MercadoPago y otros servicios externos pueden usar sus propias cookies si interactuas con sus funciones."] },
      { heading: "Gestion", body: ["Podes borrar o bloquear cookies desde la configuracion del navegador. Si las bloqueas, algunas funciones del sitio podrian no comportarse igual."] }
    ]
  },
  aviso: {
    title: "Aviso Legal",
    description: "Informacion general del sitio web de Zen Spa para Mascotas.",
    sections: [
      { heading: "Titularidad", body: ["Este sitio corresponde a Zen Spa para Mascotas, emprendimiento dedicado a peluqueria, spa, terapias, guarderia y bienestar para perros y gatos en Argentina."] },
      { heading: "Informacion publicada", body: ["La informacion del sitio es orientativa y puede actualizarse. Los servicios, horarios, disponibilidad y precios se confirman por los canales oficiales de atencion."] },
      { heading: "Salud y bienestar animal", body: ["Los servicios de bienestar, spa o terapias complementarias no reemplazan la atencion veterinaria. Ante sintomas o urgencias, se recomienda consultar a un profesional veterinario."] },
      { heading: "Propiedad intelectual", body: ["Textos, imagenes, marca, diseno y contenidos del sitio pertenecen a Zen Spa para Mascotas o se usan con autorizacion. No deben copiarse sin permiso."] },
      { heading: "Contacto", body: ["Para consultas legales, privacidad o solicitudes sobre datos personales, podes comunicarte mediante los canales publicados en el sitio."] }
    ]
  }
};

export function SiteFooter() {
  const links = [
    ["Privacidad", "/privacidad"],
    ["Terminos", "/terminos"],
    ["Cookies", "/cookies"],
    ["Aviso legal", "/aviso-legal"],
  ];

  return (
    <footer style={{ background: "#111827", color: "white", padding: "28px 18px", marginTop: 32 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div>
          <p style={{ fontWeight: 900, margin: 0, fontSize: 16 }}>Zen Spa para Mascotas</p>
          <p style={{ margin: "6px 0 0", color: "#D1D5DB", fontSize: 13 }}>Peluqueria, spa, terapias y guarderia para perros y gatos.</p>
        </div>
        <nav aria-label="Enlaces legales" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {links.map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#EDE9FE", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function CookieConsent() {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem("zen_cookie_consent") : "accepted";
  const [visible, setVisible] = useStateSafe(stored !== "accepted" && stored !== "rejected");

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem("zen_cookie_consent", value);
    window.dispatchEvent(new CustomEvent("zen_cookie_consent", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Consentimiento de cookies" style={{ position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 10020, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 12px 40px rgba(17,24,39,0.18)", borderRadius: 16, padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: "1 1 360px" }}>
          <p style={{ margin: 0, fontWeight: 900, color: "#111827" }}>Cookies y medicion</p>
          <p style={{ margin: "5px 0 0", color: "#4B5563", fontSize: 13, lineHeight: 1.5 }}>Usamos cookies necesarias y, si aceptas, medicion gratuita para mejorar reservas, chat y contenido. Podes revisar la <a href="/cookies" style={{ color: "#7C3AED", fontWeight: 800 }}>Politica de Cookies</a>.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => choose("rejected")} style={{ border: "1px solid #D1D5DB", background: "white", color: "#374151", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>Rechazar</button>
          <button onClick={() => choose("accepted")} style={{ border: "none", background: "#7C3AED", color: "white", borderRadius: 10, padding: "10px 14px", fontWeight: 900, cursor: "pointer" }}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

function useStateSafe(initial: boolean) {
  return useState(initial);
}

export function LegalPage({ type }: { type: LegalType }) {
  const page = pages[type];
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", color: "#111827" }}>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "48px 18px" }}>
        <a href="/" style={{ color: "#7C3AED", fontWeight: 800, textDecoration: "none" }}>Volver al inicio</a>
        <section style={{ background: "white", borderRadius: 18, padding: "32px 24px", marginTop: 20, boxShadow: "0 12px 34px rgba(124,58,237,0.10)" }}>
          <p style={{ color: "#7C3AED", fontWeight: 900, margin: 0, fontSize: 13 }}>Ultima actualizacion: {updatedAt}</p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "10px 0 10px", color: "#3B1A8A", fontWeight: 950 }}>{page.title}</h1>
          <p style={{ color: "#4B5563", fontSize: 17, lineHeight: 1.7, marginBottom: 26 }}>{page.description}</p>
          {page.sections.map((section) => (
            <article key={section.heading} style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 22, color: "#1F2937", marginBottom: 8 }}>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph} style={{ color: "#4B5563", lineHeight: 1.75, margin: "8px 0" }}>{paragraph}</p>)}
            </article>
          ))}
          <p style={{ marginTop: 30, color: "#6B7280", fontSize: 13 }}>Este texto es una base informativa adaptada al sitio. Para obligaciones legales especificas, conviene revisarlo con asesoria profesional local.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
