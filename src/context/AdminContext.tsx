import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiUrl } from "@/lib/api";

interface AdminCtx {
  isAdmin: boolean;
  password: string;
  activate: (pw: string) => Promise<boolean>;
  deactivate: () => void;
}

const Ctx = createContext<AdminCtx>({ isAdmin: false, password: "", activate: async () => false, deactivate: () => {} });

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("zen_admin_pw");
    if (saved) activate(saved);
  }, []);

  async function activate(pw: string): Promise<boolean> {
    if (pw.trim() !== "admin1234") return false;
    setIsAdmin(true);
    setPassword(pw.trim());
    sessionStorage.setItem("zen_admin_pw", pw.trim());
    return true;
  }

  function deactivate() {
    setIsAdmin(false);
    setPassword("");
    sessionStorage.removeItem("zen_admin_pw");
  }

  return <Ctx.Provider value={{ isAdmin, password, activate, deactivate }}>{children}</Ctx.Provider>;
}

export function useAdmin() { return useContext(Ctx); }
