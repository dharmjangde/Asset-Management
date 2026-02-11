import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// ✅ Your EXISTING Apps Script Web App URL
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyKUvX_uKYhR0j1lfZ1C7Qb2u9bygHTzf__nbuYE1atWWlEikxYQdklOvfSy5D0BYQJ/exec";

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // 🔹 AUTO-LOGIN ON APP START
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const storedCreds = localStorage.getItem("authCreds");

      if (storedCreds && !user) {
        try {
          const { id, password } = JSON.parse(atob(storedCreds));
          console.log("Attempting auto-login...");
          await login(id, password, true); // silent login
        } catch (err) {
          console.error("Auto-login failed:", err);
          // Clear invalid credentials
          localStorage.removeItem("authCreds");
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    attemptAutoLogin();
  }, []);

  // 🔹 LOGIN USING GOOGLE SHEET
  const login = async (id, password, isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);

      const res = await fetch(`${SCRIPT_URL}?sheet=USER`);
      const result = await res.json();

      if (!result.success) {
        if (!isSilent) setIsLoading(false);
        return false;
      }

      const rows = result.data;
      rows.shift(); // remove header

      const users = rows.map(r => ({
        name: r[0],
        id: String(r[1]),
        password: String(r[2]),
        role: r[3]
      }));

      if (!isSilent) console.log("Users loaded:", users);

      const foundUser = users.find(
        u => u.id === String(id) && u.password === String(password)
      );

      if (!foundUser) {
        if (!isSilent) setIsLoading(false);
        return false;
      }

      const safeUser = {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role
      };

      setUser(safeUser);
      localStorage.setItem("user", JSON.stringify(safeUser));

      // 🔐 Store credentials (base64 encoded for basic obfuscation)
      const encodedCreds = btoa(JSON.stringify({ id, password }));
      localStorage.setItem("authCreds", encodedCreds);

      if (!isSilent) setIsLoading(false);
      return true;

    } catch (err) {
      console.error("Login error:", err);
      if (!isSilent) setIsLoading(false);
      return false;
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authCreds"); // Clear stored credentials
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
