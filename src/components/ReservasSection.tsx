import { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Moon, Sun, AlertCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";

/* ─── Icons ─── */
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

/* ─── Constants ─── */
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_NAMES   = ["L","M","X","J","V","S","D"];
const ALL_HOURS   = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
const WEIGHTS     = ["Menos de 5 kg","5 – 15 kg","15 – 30 kg","Más de 30 kg"];
const AGES        = ["Cachorro (< 1 año)","Joven (1 – 3 años)","Adulto (3 – 7 años)","Senior (+ 7 años)"];

interface ServiceOption {
  id: string;
  priceId: string;
  label: string;
  desc: string;
  fallbackPrice: string;
  star?: boolean;
}

interface ServiceCategory {
  id: string;
  label: string;
  emoji: string;
  services: ServiceOption[];
}

interface PriceEntry {
  id: string;
  price: string;
  priceNote: string;
  visible: boolean;
}

interface BackendService {
  id: number | string;
  nombre: string;
  categoria?: string | null;
  activo?: number | boolean | null;
}

interface BackendClient {
  id: number | string;
  nombre: string;
  telefono?: string | null;
  whatsapp?: string | null;
}

interface CreatedEntityResponse {
  id?: number | string;
  cliente?: { id?: number | string };
  mascota?: { id?: number | string };
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCreatedId(data: CreatedEntityResponse, key: "cliente" | "mascota") {
  const id = data.id ?? data[key]?.id;
  if (!id) throw new Error("La API no devolvio un identificador valido.");
  return id;
}

function normalizePhone(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function weightToNumber(value: string) {
  if (value.includes("Menos")) return 4;
  if (value.includes("Mas") || value.includes("Más")) return 31;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length >= 2) return Math.round((numbers[0] + numbers[1]) / 2);
  return numbers[0] ?? null;
}

function pickBackendService(services: BackendService[], selected: ServiceOption | undefined, category: string, species: string) {
  const active = services.filter(service => service.activo === undefined || service.activo === null || service.activo === true || Number(service.activo) !== 0);
  const label = normalizeText(selected?.label);
  const categoryKey = normalizeText(category);
  const speciesKey = normalizeText(species);

  const byName = (needle: string) => active.find(service => normalizeText(service.nombre).includes(needle));

  if (categoryKey === "guarderia") {
    return byName(speciesKey === "gato" ? "felina" : "canina") ?? active.find(service => normalizeText(service.categoria).includes("guarderia"));
  }
  if (label.includes("premium")) return byName("premium");
  if (label.includes("relax")) return byName("relax");
  if (label.includes("armonia")) return byName("armonia") ?? byName("spa");
  if (categoryKey === "terapias") return byName("terapia") ?? byName("holistica");
  if (label.includes("peluqueria") || label.includes("bano")) return byName("peluqueria") ?? byName("bano");

  return active.find(service => normalizeText(service.categoria).includes(categoryKey)) ?? active[0];
}

const CATEGORIES: ServiceCategory[] = [
  {
    id: "spa", label: "Spa & Bienestar", emoji: "✦",
    services: [
      { id: "relax", priceId: "spa-relax", label: "Sesión Relax", desc: "Baño + aromaterapia + masaje relajante", fallbackPrice: "$10.000" },
      { id: "armonia", priceId: "spa-armonia", label: "Sesión Armonía", desc: "Baño + fangoterapia + cromoterapia", fallbackPrice: "$12.000" },
      { id: "premium", priceId: "spa-premium", label: "Sesión Premium", desc: "Spa completo · todos los beneficios", fallbackPrice: "$21.000", star: true },
    ],
  },
  {
    id: "guarderia", label: "Guardería", emoji: "🐾",
    services: [
      { id: "gua-canina", priceId: "gua-canina", label: "Guardería Canina", desc: "Cuidado con actividades para perros", fallbackPrice: "$9.000" },
      { id: "gua-felina", priceId: "gua-felina", label: "Guardería Felina", desc: "Ambiente tranquilo y seguro para gatos", fallbackPrice: "$7.500" },
    ],
  },
  {
    id: "terapias", label: "Terapias", emoji: "❧",
    services: [
      { id: "reiki", priceId: "ter-completo", label: "Reiki", desc: "Equilibrio energético y emocional", fallbackPrice: "$18.000" },
      { id: "flores", priceId: "ter-completo", label: "Flores de Bach", desc: "Terapia floral para el bienestar", fallbackPrice: "$18.000" },
      { id: "masote", priceId: "ter-completo", label: "Masoterapia", desc: "Masajes terapéuticos y relajación", fallbackPrice: "$18.000" },
    ],
  },
  {
    id: "combos", label: "Combos", emoji: "✨",
    services: [
      { id: "com-relax-pel", priceId: "com-relax-pel", label: "Relax + Peluquería", desc: "Spa relajante + peluquería completa", fallbackPrice: "$14.000" },
      { id: "com-armonia", priceId: "com-armonia", label: "Armonía + Terapia", desc: "Spa Armonía + terapia holística", fallbackPrice: "$17.000", star: true },
      { id: "com-premium", priceId: "com-premium", label: "Spa Premium + Todo", desc: "La experiencia integral más completa", fallbackPrice: "$24.000" },
    ],
  },
  {
    id: "giftcards", label: "Gift Cards", emoji: "🎁",
    services: [
      { id: "gc-relax", priceId: "gc-relax", label: "Gift Card Relax", desc: "Sesión Spa Relax completa", fallbackPrice: "$8.500" },
      { id: "gc-armonia", priceId: "gc-armonia", label: "Gift Card Armonía", desc: "Spa + terapia alternativa", fallbackPrice: "$17.000", star: true },
      { id: "gc-libre", priceId: "gc-libre", label: "Gift Card Libre", desc: "Monto y servicio a elección", fallbackPrice: "A tu medida" },
    ],
  },
];

/* ─── Availability types ─── */
interface Availability {
  blockedDates: string[];                  // YYYY-MM-DD fully blocked
  bookedSlots: Record<string, string[]>;  // YYYY-MM-DD -> booked hours
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/* ─── Helpers ─── */
function getMonthMeta(y: number, m: number) {
  const firstDow = new Date(y, m, 1).getDay();
  return { offset: firstDow === 0 ? 6 : firstDow - 1, days: new Date(y, m + 1, 0).getDate() };
}

function dateLabel(d: Date | null) {
  if (!d) return "—";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function diffDays(a: Date | null, b: Date | null) {
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/* ─── Sub-components ─── */

function MiniCalendar({
  selected, onSelect, rangeStart, rangeEnd,
  blockedDates, bookedDates, onMonthChange,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  blockedDates?: Set<string>;
  bookedDates?: Set<string>;
  onMonthChange?: (year: number, month: number) => void;
}) {
  const today = new Date();
  const [curMonth, setCurMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const changeMonth = (delta: number) => {
    const next = new Date(curMonth.getFullYear(), curMonth.getMonth() + delta, 1);
    setCurMonth(next);
    onMonthChange?.(next.getFullYear(), next.getMonth());
  };

  const { offset, days } = getMonthMeta(curMonth.getFullYear(), curMonth.getMonth());

  const isSameDay = (d: Date, day: number) =>
    d.getFullYear() === curMonth.getFullYear() &&
    d.getMonth() === curMonth.getMonth() &&
    d.getDate() === day;

  const inRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), day);
    const lo = rangeStart < rangeEnd ? rangeStart : rangeEnd;
    const hi = rangeStart < rangeEnd ? rangeEnd   : rangeStart;
    return d > lo && d < hi;
  };

  const isPast = (day: number) => {
    const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  const dayKey = (day: number) =>
    `${curMonth.getFullYear()}-${String(curMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => changeMonth(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#7C3AED", padding: 4, display: "flex" }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#4C1D95" }}>
          {MONTH_NAMES[curMonth.getMonth()]} {curMonth.getFullYear()}
        </span>
        <button onClick={() => changeMonth(1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#7C3AED", padding: 4, display: "flex" }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 700, color: "#C4B5FD", padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const key = dayKey(day);
          const isSel    = !!selected && isSameDay(selected, day);
          const isRSt    = !!rangeStart && isSameDay(rangeStart, day);
          const isREn    = !!rangeEnd   && isSameDay(rangeEnd, day);
          const isEnd    = isRSt || isREn;
          const isToday  = isSameDay(today, day);
          const isSun    = ((offset + i) % 7) === 6;
          const past     = isPast(day);
          const blocked  = blockedDates?.has(key) ?? false;
          const hasBooking = bookedDates?.has(key) ?? false;
          const disabled = isSun || past || blocked;

          return (
            <button
              key={day}
              onClick={() => !disabled && onSelect(new Date(curMonth.getFullYear(), curMonth.getMonth(), day))}
              disabled={disabled}
              title={blocked ? "Día no disponible" : hasBooking ? "Tiene turnos reservados" : undefined}
              style={{
                borderRadius: (isRSt || isREn) ? 8 : inRange(day) ? 0 : 8,
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                padding: "4px 2px 2px",
                fontSize: 12,
                fontWeight: isSel || isEnd ? 800 : 400,
                background: blocked
                  ? "#FEE2E2"
                  : isSel || isEnd
                    ? "#7C3AED"
                    : inRange(day) ? "#EDE9FE"
                    : isToday ? "#F5F0FF"
                    : "transparent",
                color: blocked
                  ? "#EF4444"
                  : isSel || isEnd ? "white"
                  : (isSun || past) ? "#E5E7EB"
                  : isToday ? "#7C3AED"
                  : "#374151",
                transition: "all 0.1s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                lineHeight: 1,
                opacity: past ? 0.5 : 1,
              }}
            >
              <span>{day}</span>
              {/* Booking indicator dot */}
              {hasBooking && !blocked && !isSel && !isEnd && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#F59E0B", display: "block", flexShrink: 0 }} />
              )}
              {!hasBooking && <span style={{ width: 4, height: 4, display: "block" }} />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#FEE2E2", display: "block", border: "1px solid #FCA5A5" }} />
          <span style={{ fontSize: 9.5, color: "#9CA3AF" }}>No disponible</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "block" }} />
          <span style={{ fontSize: 9.5, color: "#9CA3AF" }}>Con turnos</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#7C3AED", display: "block" }} />
          <span style={{ fontSize: 9.5, color: "#9CA3AF" }}>Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", gap: 0, border: "1.5px solid", borderColor: "#EDE9FE", borderRadius: 10, overflow: "hidden" }}>
        {[{ v: true, l: "Sí" }, { v: false, l: "No" }].map(opt => (
          <button key={String(opt.v)} onClick={() => onChange(opt.v)} style={{
            padding: "5px 14px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
            background: value === opt.v ? "#7C3AED" : "transparent",
            color: value === opt.v ? "white" : "#9CA3AF",
            transition: "all 0.12s",
          }}>{opt.l}</button>
        ))}
      </div>
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#C4B5FD", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#FAFAFA", border: "1.5px solid #EDE9FE",
  borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "#374151",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

function Sel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: string[] }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: "none", paddingRight: 28, cursor: "pointer" }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #EDE9FE", boxShadow: "0 2px 16px rgba(124,58,237,0.07)", padding: "20px 18px", ...style }}>
      {children}
    </div>
  );
}

function SDivider() {
  return <div style={{ height: 1, background: "#F5F0FF", margin: "14px 0" }} />;
}

/* ─── Hour selector with availability ─── */
function HourSelector({
  value, onChange, bookedHours, label,
}: {
  value: string;
  onChange: (v: string) => void;
  bookedHours: string[];
  label?: string;
}) {
  return (
    <div>
      {label && <SLabel>{label}</SLabel>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
        {ALL_HOURS.map(h => {
          const booked = bookedHours.includes(h);
          const sel = value === h;
          return (
            <button
              key={h}
              disabled={booked}
              onClick={() => !booked && onChange(h)}
              title={booked ? "Hora reservada" : undefined}
              style={{
                padding: "6px 4px",
                fontSize: 11.5,
                fontWeight: sel ? 800 : 500,
                borderRadius: 8,
                border: sel ? "2px solid #7C3AED" : booked ? "1.5px solid #FCA5A5" : "1.5px solid #EDE9FE",
                background: sel ? "#7C3AED" : booked ? "#FEE2E2" : "#FAFAFA",
                color: sel ? "white" : booked ? "#FCA5A5" : "#374151",
                cursor: booked ? "not-allowed" : "pointer",
                transition: "all 0.12s",
                textDecoration: booked ? "line-through" : "none",
                position: "relative",
              }}
            >
              {h}
              {booked && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "#EF4444", display: "block" }} />
              )}
            </button>
          );
        })}
      </div>
      {bookedHours.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          <AlertCircle size={11} color="#F59E0B" />
          <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>
            {bookedHours.length} {bookedHours.length === 1 ? "horario reservado" : "horarios reservados"} en este día
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function ReservasSection() {
  // Service
  const [category, setCategory] = useState("spa");
  const [service,  setService]  = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceEntry>>({});

  useEffect(() => {
    fetch(apiUrl("/api/prices"))
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((entries: PriceEntry[]) => {
        setPrices(Object.fromEntries(entries.filter(entry => entry.visible).map(entry => [entry.id, entry])));
      })
      .catch(() => { /* keep fallback prices */ });
  }, []);

  useEffect(() => {
    const storedName = window.localStorage.getItem("zen-chat-cliente-nombre") || "";
    const storedWhatsapp = window.localStorage.getItem("zen-chat-cliente-whatsapp") || "";
    if (storedName) setOwnerName(storedName);
    if (storedWhatsapp) setOwnerWhatsapp(storedWhatsapp);
  }, []);

  // Customer profile
  const [ownerName, setOwnerName] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");

  // Pet profile
  const [species,  setSpecies]  = useState<"Perro"|"Gato">("Perro");
  const [petName,  setPetName]  = useState("");
  const [weight,   setWeight]   = useState(WEIGHTS[0]);
  const [age,      setAge]      = useState(AGES[0]);

  // SPA / Terapias — single date
  const [spaDate, setSpaDate] = useState<Date | null>(null);
  const [spaHour, setSpaHour] = useState("10:00");

  // Guardería — date range
  const [activeField, setActiveField] = useState<"start"|"end">("start");
  const [startDate,   setStartDate]   = useState<Date | null>(null);
  const [endDate,     setEndDate]     = useState<Date | null>(null);
  const [startHour,   setStartHour]   = useState("10:00");
  const [endHour,     setEndHour]     = useState("18:00");

  // Care details
  const [specialFood,    setSpecialFood]    = useState(false);
  const [foodBrand,      setFoodBrand]      = useState("");
  const [foodPortion,    setFoodPortion]    = useState("");
  const [foodSchedule,   setFoodSchedule]   = useState("");
  const [customFood,     setCustomFood]     = useState("");
  const [bringsBlanket,  setBringsBlanket]  = useState(false);
  const [bringsBed,      setBringsBed]      = useState(false);
  const [extraNotes,     setExtraNotes]     = useState("");

  // UI
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Availability
  const today = new Date();
  const [displayedYear,  setDisplayedYear]  = useState(today.getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState(today.getMonth());
  const [availability,   setAvailability]   = useState<Availability>({ blockedDates: [], bookedSlots: {} });
  const [availLoading,   setAvailLoading]   = useState(false);

  const fetchAvailability = useCallback(async (year: number, month: number) => {
    setAvailLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/availability?month=${monthKey(year, month)}`));
      if (res.ok) setAvailability(await res.json());
    } catch {
      // silently fail — don't block booking
    } finally {
      setAvailLoading(false);
    }
  }, []);

  // Fetch on mount and on category/month change
  useEffect(() => {
    fetchAvailability(displayedYear, displayedMonth);
  }, [displayedYear, displayedMonth, fetchAvailability]);

  const handleMonthChange = (year: number, month: number) => {
    setDisplayedYear(year);
    setDisplayedMonth(month);
  };

  // Derived availability sets
  const blockedDatesSet = new Set(availability.blockedDates);
  const bookedDatesSet  = new Set(Object.keys(availability.bookedSlots));

  // Hours already booked for the selected date
  const spaBookedHours   = spaDate   ? (availability.bookedSlots[toYMD(spaDate)]   ?? []) : [];
  const startBookedHours = startDate ? (availability.bookedSlots[toYMD(startDate)] ?? []) : [];

  // If selected hour is now unavailable, reset to first free hour
  useEffect(() => {
    if (spaBookedHours.includes(spaHour)) {
      const free = ALL_HOURS.find(h => !spaBookedHours.includes(h));
      if (free) setSpaHour(free);
    }
  }, [spaDate, spaBookedHours.join(",")]);

  const currentCat   = CATEGORIES.find(c => c.id === category)!;
  const selectedSvc  = currentCat.services.find(s => s.id === service);
  const isGuarderia  = category === "guarderia";
  const nights       = diffDays(startDate, endDate);
  const stayType     = nights === null ? null : nights === 0 ? "Guardería diurna" : nights === 1 ? "1 noche" : `${nights} noches`;
  const priceEntry   = selectedSvc ? prices[selectedSvc.priceId] : undefined;
  const basePrice    = priceEntry?.price || selectedSvc?.fallbackPrice || "—";
  const dailyAmount  = Number(basePrice.replace(/[^0-9]/g, ""));
  const guarderiaDays = Math.max(1, nights ?? 1);
  const finalPrice = isGuarderia && dailyAmount > 0
    ? `$${(dailyAmount * guarderiaDays).toLocaleString("es-AR")}`
    : basePrice;

  const handleCatChange = (id: string) => { setCategory(id); setService(null); };

  const handleRangeSelect = (d: Date) => {
    if (activeField === "start") {
      setStartDate(d);
      if (endDate && d > endDate) setEndDate(null);
      setActiveField("end");
    } else {
      if (startDate && d < startDate) {
        setStartDate(d); setEndDate(null); setActiveField("end");
      } else {
        setEndDate(d); setActiveField("start");
      }
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!service) {
      setSubmitError("Elegí un servicio antes de solicitar el turno.");
      return;
    }
    if (!ownerName.trim()) {
      setSubmitError("Ingresá tu nombre para identificar la reserva.");
      return;
    }
    if (!normalizePhone(ownerWhatsapp)) {
      setSubmitError("Ingresá tu WhatsApp para sumar tus checks de fidelidad.");
      return;
    }
    if (!petName.trim()) {
      setSubmitError("Ingresá el nombre de tu mascota.");
      return;
    }
    if (isGuarderia ? !startDate : !spaDate) {
      setSubmitError(isGuarderia ? "Seleccioná la fecha de ingreso." : "Seleccioná la fecha del turno.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const selectedDate = isGuarderia ? startDate : spaDate;
      const selectedHour = isGuarderia ? startHour : spaHour;
      if (!selectedDate || !selectedHour) throw new Error("Fecha u horario invalido.");

      const notes = [
        "Solicitud creada desde la web",
        `Responsable: ${ownerName.trim()}`,
        `WhatsApp: ${ownerWhatsapp.trim()}`,
        `Servicio solicitado: ${selectedSvc?.label ?? service}`,
        `Precio mostrado: ${finalPrice}`,
        `Mascota: ${petName} (${species})`,
        `Peso: ${weight}`,
        `Edad: ${age}`,
        isGuarderia && endDate ? `Egreso: ${toYMD(endDate)} ${endHour}` : null,
        specialFood ? `Alimentacion especial: ${foodBrand || "Sin marca"} - ${foodPortion || "Sin porcion"} - ${foodSchedule || "Sin horario"}` : null,
        specialFood && customFood ? `Detalle alimento: ${customFood}` : null,
        bringsBlanket ? "Trae manta" : "No trae manta",
        bringsBed ? "Trae cama" : "No trae cama",
        extraNotes ? `Notas: ${extraNotes}` : null,
      ].filter(Boolean).join(" | ");

      const ownerPhone = normalizePhone(ownerWhatsapp);
      let clienteId: number | string | null = null;

      const clientesRes = await fetch(apiUrl("/api/clientes"));
      if (clientesRes.ok) {
        const clientes = (await clientesRes.json()) as BackendClient[];
        const existingClient = clientes.find((cliente) =>
          normalizePhone(cliente.whatsapp) === ownerPhone || normalizePhone(cliente.telefono) === ownerPhone
        );
        if (existingClient) clienteId = existingClient.id;
      }

      if (!clienteId) {
        const clienteRes = await fetch(apiUrl("/api/clientes"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: ownerName.trim(),
            telefono: ownerWhatsapp.trim(),
            whatsapp: ownerWhatsapp.trim(),
            email: "",
            direccion: "",
            notas: notes,
          }),
        });
        if (!clienteRes.ok) throw new Error("No se pudo crear el cliente web.");
        clienteId = getCreatedId(await clienteRes.json(), "cliente");
      }

      const mascotaRes = await fetch(apiUrl("/api/mascotas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          nombre: petName.trim(),
          especie: species,
          raza: "",
          peso: weightToNumber(weight),
          edad: age,
          sexo: "",
          notas: notes,
          tipo_mascota: species,
          talla: weight,
          alimento_tipo: specialFood ? [foodBrand, foodPortion, foodSchedule].filter(Boolean).join(" - ") : "",
          alimento_especial: specialFood,
          horario_preferido: selectedHour,
          camita: bringsBed,
          mantita: bringsBlanket,
        }),
      });
      if (!mascotaRes.ok) throw new Error("No se pudo crear la mascota.");
      const mascotaId = getCreatedId(await mascotaRes.json(), "mascota");

      const serviciosRes = await fetch(apiUrl("/api/servicios/activos/true"));
      if (!serviciosRes.ok) throw new Error("No se pudieron cargar los servicios.");
      const backendServices = (await serviciosRes.json()) as BackendService[];
      const backendService = pickBackendService(backendServices, selectedSvc, category, species);
      if (!backendService) throw new Error("No hay servicios activos para crear el turno.");

      const res = await fetch(apiUrl("/api/turnos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          mascota_id: mascotaId,
          servicio_id: backendService.id,
          fecha: toYMD(selectedDate),
          hora: selectedHour,
          fecha_egreso: isGuarderia && endDate ? toYMD(endDate) : null,
          hora_egreso: isGuarderia ? endHour : null,
          observaciones: notes,
        }),
      });
      if (!res.ok) throw new Error();
      const createdBooking = await res.json();
      setBookingId(createdBooking.id ?? null);
      setSubmitted(true);
      // Re-fetch availability to reflect new booking
      fetchAvailability(displayedYear, displayedMonth);
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setSubmitError("No se pudo guardar la reserva. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRows = isGuarderia ? [
    { label: "Servicio", value: selectedSvc?.label ?? "—" },
    { label: "Mascota",  value: petName || "—" },
    { label: "Especie",  value: species },
    { label: "Peso",     value: weight },
    { label: "Edad",     value: age.split(" ")[0] },
    { label: "Ingreso",  value: startDate ? `${dateLabel(startDate)} · ${startHour}` : "—" },
    { label: "Egreso",   value: endDate   ? `${dateLabel(endDate)} · ${endHour}` : "—" },
    { label: "Estadía",  value: stayType ?? "—" },
    { label: "Precio final", value: finalPrice },
    { label: "Manta",    value: bringsBlanket ? "Trae la suya" : "No trae" },
    { label: "Cama",     value: bringsBed ? "Trae la suya" : "No trae" },
  ] : [
    { label: "Servicio", value: selectedSvc?.label ?? "—" },
    { label: "Mascota",  value: petName || "—" },
    { label: "Especie",  value: species },
    { label: "Peso",     value: weight },
    { label: "Edad",     value: age.split(" ")[0] },
    { label: "Fecha",    value: dateLabel(spaDate) },
    { label: "Hora",     value: spaDate ? spaHour : "—" },
    { label: "Precio final", value: finalPrice },
  ];

  return (
    <section id="reservas" style={{ background: "linear-gradient(180deg, #fdf9ff 0%, #fff 100%)", padding: "56px 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "white", border: "1px solid #DDD6FE", borderRadius: 999, padding: "5px 14px", marginBottom: 10 }}>
            <PawIcon size={12} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.07em", textTransform: "uppercase" }}>Reservas y Turnos</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)", fontWeight: 900, color: "#111827", margin: 0 }}>
            Reservá el turno de tu mascota
          </h2>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 5 }}>
            Completá el formulario y confirmamos tu turno por mensaje.
          </p>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCatChange(cat.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 12, border: "1.5px solid", cursor: "pointer",
              fontSize: 13, fontWeight: 700, transition: "all 0.15s",
              borderColor: category === cat.id ? "#7C3AED" : "#EDE9FE",
              background:  category === cat.id ? "#7C3AED" : "white",
              color:       category === cat.id ? "white"   : "#6B7280",
              boxShadow:   category === cat.id ? "0 3px 12px rgba(124,58,237,0.22)" : "none",
            }}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Success banner */}
        {submitted && (
          <div style={{ background: "linear-gradient(135deg,#EDE9FE,#F5F0FF)", border: "1px solid #DDD6FE", borderRadius: 14, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <PawIcon size={20} />
            <div>
              <p style={{ fontWeight: 800, color: "#4C1D95", margin: 0, fontSize: 14 }}>¡Turno solicitado con éxito!</p>
              <p style={{ fontSize: 12.5, color: "#7C3AED", margin: 0 }}>
                {bookingId ? `Solicitud #${bookingId}. ` : ""}Nos pondremos en contacto para confirmar tu reserva.
              </p>
            </div>
          </div>
        )}

        {/* 3-column form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* COL 1: Service + Pet */}
          <Card>
            <SLabel>Elegí el servicio</SLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 0 }}>
              {currentCat.services.map(svc => (
                <div key={svc.id} onClick={() => setService(svc.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  border: "1.5px solid",
                  borderColor: service === svc.id ? "#7C3AED" : "#EDE9FE",
                  background:  service === svc.id ? "#F5F0FF" : "#FAFAFA",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    border: service === svc.id ? "5px solid #7C3AED" : "1.5px solid #D1D5DB",
                    background: "white", transition: "all 0.15s",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", margin: 0 }}>{svc.label}</p>
                      {"star" in svc && svc.star && (
                        <span style={{ fontSize: 10, background: "#F59E0B", color: "white", borderRadius: 6, padding: "1px 6px", fontWeight: 700 }}>Popular</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{svc.desc}</p>
                    <p style={{ fontSize: 12, color: "#7C3AED", margin: "2px 0 0", fontWeight: 800 }}>
                      {prices[svc.priceId]?.price || svc.fallbackPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg,#F5F0FF,#EDE9FE)", border: "1px solid #DDD6FE", borderRadius: 12, padding: "11px 13px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#6D28D9", fontWeight: 700 }}>Total final</span>
              <span style={{ fontSize: 19, color: "#4C1D95", fontWeight: 900 }}>{finalPrice}</span>
            </div>

            <SDivider />

            <SLabel>Datos del responsable</SLabel>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Tu nombre</label>
              <input placeholder="Nombre y apellido" value={ownerName} onChange={e => setOwnerName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>WhatsApp</label>
              <input placeholder="Ej: 343 526 3898" value={ownerWhatsapp} onChange={e => setOwnerWhatsapp(e.target.value)} style={inputStyle} />
            </div>

            <SDivider />

            <SLabel>Perfil de tu mascota</SLabel>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {(["Perro","Gato"] as const).map(s => (
                <button key={s} onClick={() => setSpecies(s)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12.5,
                  fontWeight: 700, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
                  borderColor: species === s ? "#7C3AED" : "#EDE9FE",
                  background:  species === s ? "#F5F0FF" : "#FAFAFA",
                  color:       species === s ? "#7C3AED" : "#6B7280",
                }}>
                  {s === "Perro" ? "🐶" : "🐱"} {s}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre</label>
              <input placeholder="¿Cómo se llama?" value={petName} onChange={e => setPetName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Peso</label>
              <Sel value={weight} onChange={setWeight} opts={WEIGHTS} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Edad</label>
              <Sel value={age} onChange={setAge} opts={AGES} />
            </div>
          </Card>

          {/* COL 2: Date & Time */}
          <Card>
            {!isGuarderia ? (
              <>
                <SLabel>Fecha del turno</SLabel>
                {availLoading && (
                  <div style={{ fontSize: 11, color: "#A78BFA", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#A78BFA", display: "inline-block", animation: "pulse 1s infinite" }} />
                    Actualizando disponibilidad...
                  </div>
                )}
                <MiniCalendar
                  selected={spaDate}
                  onSelect={d => { setSpaDate(d); }}
                  blockedDates={blockedDatesSet}
                  bookedDates={bookedDatesSet}
                  onMonthChange={handleMonthChange}
                />
                <SDivider />
                <HourSelector
                  label="Horario"
                  value={spaHour}
                  onChange={setSpaHour}
                  bookedHours={spaBookedHours}
                />
                {spaDate && (
                  <div style={{ marginTop: 12, background: "#F5F0FF", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={13} color="#7C3AED" />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4C1D95" }}>{dateLabel(spaDate)} · {spaHour}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <SLabel>Período de estadía</SLabel>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {[
                    { key: "start" as const, label: "Ingreso", icon: <Sun size={12} />, date: startDate, hour: startHour, setHour: setStartHour },
                    { key: "end"   as const, label: "Egreso",  icon: <Moon size={12} />, date: endDate,   hour: endHour,   setHour: setEndHour   },
                  ].map(f => (
                    <button key={f.key} onClick={() => setActiveField(f.key)} style={{
                      flex: 1, padding: "8px 10px", borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                      border: "1.5px solid", cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                      borderColor: activeField === f.key ? "#7C3AED" : "#EDE9FE",
                      background:  activeField === f.key ? "#F5F0FF" : "#FAFAFA",
                      color:       activeField === f.key ? "#7C3AED" : "#6B7280",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>{f.icon} {f.label}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 400, color: "#9CA3AF" }}>
                        {f.date ? `${dateLabel(f.date)} · ${f.hour}` : "Sin seleccionar"}
                      </div>
                    </button>
                  ))}
                </div>

                {availLoading && (
                  <div style={{ fontSize: 11, color: "#A78BFA", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#A78BFA", display: "inline-block" }} />
                    Actualizando disponibilidad...
                  </div>
                )}
                <MiniCalendar
                  selected={activeField === "start" ? startDate : endDate}
                  onSelect={handleRangeSelect}
                  rangeStart={startDate}
                  rangeEnd={endDate}
                  blockedDates={blockedDatesSet}
                  bookedDates={bookedDatesSet}
                  onMonthChange={handleMonthChange}
                />

                <SDivider />
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <Sun size={11} color="#9CA3AF" />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.07em", textTransform: "uppercase" }}>Hora ingreso</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Clock size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                      <select value={startHour} onChange={e => setStartHour(e.target.value)}
                        style={{ ...inputStyle, appearance: "none", paddingLeft: 28, paddingRight: 28, cursor: "pointer" }}>
                        {ALL_HOURS.map(h => {
                          const booked = startBookedHours.includes(h);
                          return <option key={h} value={h} disabled={booked}>{h}{booked ? " ✗" : ""}</option>;
                        })}
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <Moon size={11} color="#9CA3AF" />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.07em", textTransform: "uppercase" }}>Hora egreso</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Clock size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                      <select value={endHour} onChange={e => setEndHour(e.target.value)}
                        style={{ ...inputStyle, appearance: "none", paddingLeft: 28, paddingRight: 28, cursor: "pointer" }}>
                        {ALL_HOURS.map(h => <option key={h}>{h}</option>)}
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>

                {stayType && (
                  <div style={{ marginTop: 12, background: "#F5F0FF", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={13} color="#7C3AED" />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4C1D95" }}>{stayType}</span>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* COL 3: Details + Summary */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {isGuarderia && (
              <>
                <SLabel>Detalles de estadía</SLabel>
                <Toggle value={specialFood} onChange={setSpecialFood} label="Alimentación especial" />
                {specialFood && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "6px 0 4px" }}>
                    {[
                      { label: "Marca del alimento", value: foodBrand,    set: setFoodBrand,    ph: "Ej: Royal Canin" },
                      { label: "Porción por comida",  value: foodPortion,  set: setFoodPortion,  ph: "Ej: 1 taza" },
                      { label: "Horario de comidas",  value: foodSchedule, set: setFoodSchedule, ph: "Ej: 8:00 y 20:00" },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 3 }}>{f.label}</label>
                        <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inputStyle} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 3 }}>Notas adicionales</label>
                      <textarea value={customFood} onChange={e => setCustomFood(e.target.value)} rows={2} placeholder="Alergias, restricciones..." style={{ ...inputStyle, resize: "none" }} />
                    </div>
                  </div>
                )}
                <SDivider />
                <Toggle value={bringsBlanket} onChange={setBringsBlanket} label="Trae su manta" />
                <Toggle value={bringsBed}     onChange={setBringsBed}     label="Trae su cama" />
                <SDivider />
              </>
            )}

            <SLabel>Notas adicionales</SLabel>
            <textarea
              value={extraNotes} onChange={e => setExtraNotes(e.target.value)}
              rows={isGuarderia ? 2 : 4}
              placeholder="Comportamiento, medicación, cosas importantes..."
              style={{ ...inputStyle, resize: "none", marginBottom: 12 }}
            />

            <SDivider />

            {/* Summary */}
            <SLabel>Resumen del turno</SLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
              {summaryRows.map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#9CA3AF", fontWeight: 500 }}>{r.label}</span>
                  <span style={{ color: "#374151", fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{r.value}</span>
                </div>
              ))}
            </div>

            {submitError && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#DC2626", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={13} /> {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                background: submitting ? "#C4B5FD" : "#7C3AED",
                color: "white",
                fontWeight: 800, fontSize: 14, cursor: submitting ? "wait" : "pointer",
                boxShadow: submitting ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
                transition: "all 0.2s",
              }}
            >
              {submitting ? "Enviando…" : "Solicitar turno →"}
            </button>
            <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 8 }}>
              Te confirmaremos por WhatsApp o mail
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
