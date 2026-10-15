import { createContext, useCallback, useContext, useState } from "react";
import { api } from "./lib";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ld_user")); } catch { return null; }
  });

  const save = (u) => {
    setUser(u);
    try { u ? localStorage.setItem("ld_user", JSON.stringify(u)) : localStorage.removeItem("ld_user"); } catch { /* ignore */ }
  };

  // Calls the API with the saved token; signs out automatically if the token has expired.
  const call = useCallback(async (path, opts = {}) => {
    try {
      return await api(path, { ...opts, token: user?.token });
    } catch (e) {
      if (e.status === 401 && user) save(null);
      throw e;
    }
  }, [user]);

  return <Ctx.Provider value={{ user, signIn: save, signOut: () => save(null), call }}>{children}</Ctx.Provider>;
}