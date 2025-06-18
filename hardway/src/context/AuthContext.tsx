import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  FC,
} from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  rol: string | null;
  username: string | null;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  legajoPicker: string | null; // NUEVO
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  error: null,
  rol: null,
  username: null,
  showWelcome: false,
  setShowWelcome: () => {},
  legajoPicker: null, // NUEVO
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const login = async (usernameInput: string, password: string) => {
    setError(null);
    try {
      const response = await axios.post("/api/login", {
        nombreUsuario: usernameInput,
        contrasena: password,
      });
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("rol", response.data.tipoRol || "");
      localStorage.setItem("username", response.data.nombreUsuario);
      // Guarda el legajoPicker si existe
      if (response.data.legajoPicker) {
        localStorage.setItem("legajoPicker", response.data.legajoPicker);
      } else {
        localStorage.removeItem("legajoPicker");
      }
      setIsAuthenticated(true);
      setRol(response.data.tipoRol || "");
      setUsername(response.data.nombreUsuario);
      setShowWelcome(true); // Activa el mensaje tras login exitoso
      return true;
    } catch (error) {
      setError("Credenciales inválidas");
      setIsAuthenticated(false);
      setRol(null);
      setUsername(null);
      localStorage.removeItem("legajoPicker");
      return false;
    }
  };

  const logout = () => {
    localStorage.clear(); // Borra todo el localStorage
    setIsAuthenticated(false);
    setRol(null);
    setUsername(null);
  };

  // En el useEffect de AuthProvider, recupera legajoPicker
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    let storedRol = localStorage.getItem("rol");
    // Normaliza el valor del rol para pickers al recargar
    if (storedRol && storedRol.toLowerCase().includes("picker")) {
      storedRol = "Picker";
      localStorage.setItem("rol", "Picker");
    }
    if (authStatus === "true" && storedUsername && storedRol) {
      // Verifica con el backend si el usuario sigue siendo válido
      axios
        .get("/api/usuarios/validate", {
          params: { username: storedUsername },
        })
        .then((res) => {
          if (res.data.valid) {
            setIsAuthenticated(true);
            setRol(storedRol);
            setUsername(storedUsername);
          } else {
            // Si no es válido, forzar logout
            logout();
          }
        })
        .catch(() => {
          logout();
        });
    } else {
      setIsAuthenticated(false);
      setRol(null);
      setUsername(null);
      localStorage.removeItem("legajoPicker");
    }
  }, []);

  // Exporta legajoPicker en el contexto
  const legajoPicker = localStorage.getItem("legajoPicker") || null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        error,
        rol,
        username,
        showWelcome,
        setShowWelcome,
        legajoPicker, // NUEVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
