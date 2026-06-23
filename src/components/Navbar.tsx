import { useState } from "react";
import { Calendar, ChevronDown, Menu, X, Gift } from "lucide-react";
import { scrollToReservas } from "@/lib/scrollToReservas";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tratOpen, setTratOpen] = useState(false);

  const close = () => { setMenuOpen(false); setTratOpen(false); };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <img src="/assets/logo.png" alt="ZEN - Bienestar para tu mascota" className="w-auto" style={{ height: 82 }} />
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
              Inicio
            </button>

            {/* Tratamientos dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
                Tratamientos <ChevronDown size={14} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ minWidth: 210 }}>
                {/* Spa */}
                <div className="px-4 pt-1 pb-0.5">
                  <span className="text-[10px] font-700 text-purple-400 uppercase tracking-wider font-bold">Spa</span>
                </div>
                <button onClick={() => scrollTo("spa")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">🛁</span> Spa Relax
                </button>
                <button onClick={() => scrollTo("spa")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">🌿</span> Spa Armonía
                </button>
                <button onClick={() => scrollTo("spa")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">✨</span> Spa Premium
                </button>

                <div className="my-1 mx-3 border-t border-gray-100" />

                {/* Otros servicios */}
                <div className="px-4 pt-1 pb-0.5">
                  <span className="text-[10px] font-700 text-purple-400 uppercase tracking-wider font-bold">Servicios</span>
                </div>
                <button onClick={() => scrollTo("terapias")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">🔮</span> Terapias Alternativas
                </button>
                <button onClick={() => scrollTo("guarderia")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">🏠</span> Guardería & Peluquería
                </button>

                <div className="my-1 mx-3 border-t border-gray-100" />

                {/* Especiales */}
                <div className="px-4 pt-1 pb-0.5">
                  <span className="text-[10px] font-700 text-purple-400 uppercase tracking-wider font-bold">Especiales</span>
                </div>
                <button onClick={() => scrollTo("combos")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <span className="text-base">🎁</span> Combos Especiales
                </button>
                <button onClick={() => scrollTo("gift-cards")} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  <Gift size={14} className="text-amber-500 flex-shrink-0" /> Gift Cards
                </button>
              </div>
            </div>

            <button onClick={() => scrollTo("sobre-mi")}
              className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
              Sobre mí
            </button>
            <button onClick={() => scrollTo("resultados")}
              className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
              Resultados reales
            </button>
            <button onClick={scrollToReservas}
              className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
              Reservas
            </button>
            <button onClick={() => scrollTo("ubicaciones")}
              className="text-sm font-medium text-gray-800 hover:text-purple-700 transition-colors bg-transparent border-none cursor-pointer">
              Contacto
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <button onClick={scrollToReservas}
              className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
              style={{ boxShadow: "0 2px 8px rgba(124,58,237,0.22)", fontSize: 12, padding: "7px 13px" }}>
              <Calendar size={13} /> Reservar turno
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-0.5">

          <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); close(); }}
            className="block w-full text-left py-2.5 px-2 text-sm font-medium text-gray-800 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
            Inicio
          </button>

          {/* Spa group */}
          <p className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">Spa</p>
          {[
            { label: "🛁  Spa Relax", id: "spa" },
            { label: "🌿  Spa Armonía", id: "spa" },
            { label: "✨  Spa Premium", id: "spa" },
          ].map(item => (
            <button key={item.label} onClick={() => { scrollTo(item.id); close(); }}
              className="block w-full text-left py-2 px-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              {item.label}
            </button>
          ))}

          <p className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">Servicios</p>
          {[
            { label: "🔮  Terapias Alternativas", id: "terapias" },
            { label: "🏠  Guardería & Peluquería", id: "guarderia" },
          ].map(item => (
            <button key={item.label} onClick={() => { scrollTo(item.id); close(); }}
              className="block w-full text-left py-2 px-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              {item.label}
            </button>
          ))}

          <p className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">Especiales</p>
          {[
            { label: "🎁  Combos Especiales", id: "combos" },
            { label: "🎀  Gift Cards", id: "gift-cards" },
          ].map(item => (
            <button key={item.label} onClick={() => { scrollTo(item.id); close(); }}
              className="block w-full text-left py-2 px-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              {item.label}
            </button>
          ))}

          <div className="border-t border-gray-100 pt-1" />
          {[
            { label: "Sobre mí", action: () => { scrollTo("sobre-mi"); close(); } },
            { label: "Resultados reales", action: () => { scrollTo("resultados"); close(); } },
            { label: "Reservas y turnos", action: () => { scrollToReservas(); close(); } },
            { label: "Contacto", action: () => { scrollTo("ubicaciones"); close(); } },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="block w-full text-left py-2.5 px-2 text-sm font-medium text-gray-800 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              {item.label}
            </button>
          ))}

          <div className="pt-2">
            <button onClick={() => { scrollToReservas(); close(); }}
              className="flex items-center justify-center gap-2 bg-purple-700 text-white text-sm font-semibold px-5 py-3 rounded-xl w-full"
              style={{ boxShadow: "0 2px 10px rgba(124,58,237,0.25)" }}>
              <Calendar size={16} /> Reservar turno
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
