import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { AdminProvider } from "@/context/AdminContext";
import AdminFloatingButton from "@/components/AdminFloatingButton";
import { CookieConsent, LegalPage } from "@/pages/LegalPages";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600">Página no encontrada</p>
      </div>
    </div>
  );
}

function Privacidad() { return <LegalPage type="privacidad" />; }
function Terminos() { return <LegalPage type="terminos" />; }
function Cookies() { return <LegalPage type="cookies" />; }
function AvisoLegal() { return <LegalPage type="aviso" />; }

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/terminos" component={Terminos} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
        <CookieConsent />
        <AdminFloatingButton />
      </WouterRouter>
    </AdminProvider>
  );
}
