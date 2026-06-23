export function scrollToReservas() {
  const el = document.getElementById("reservas");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
