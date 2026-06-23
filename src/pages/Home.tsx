import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SpaSection from "@/components/SpaSection";
import TerapiasSection from "@/components/TerapiasSection";
import GuarderiaSection from "@/components/GuarderiaSection";
import CombosSection from "@/components/CombosSection";
import GiftCardsSection from "@/components/GiftCardsSection";
import RequisitosSection from "@/components/RequisitosSection";
import SobreMiSection from "@/components/SobreMiSection";
import ResultadosSection from "@/components/ResultadosSection";
import ReservasSection from "@/components/ReservasSection";
import UbicacionesSection from "@/components/UbicacionesSection";
import FloatingChat from "@/components/FloatingChat";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <SpaSection />
      <TerapiasSection />
      <GuarderiaSection />
      <CombosSection />
      <GiftCardsSection />
      <RequisitosSection />
      <SobreMiSection />
      <ResultadosSection />
      <ReservasSection />
      <UbicacionesSection />
      <FloatingChat />
    </div>
  );
}
