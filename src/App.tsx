import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { AdminProvider } from "@/context/AdminContext";
import AdminFloatingButton from "@/components/AdminFloatingButton";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
        <AdminFloatingButton />
      </WouterRouter>
    </AdminProvider>
  );
}
