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
      return false;
    }
  };

  const logout = () => {
    localStorage.clear(); // Borra todo el localStorage
    setIsAuthenticated(false);
    setRol(null);
    setUsername(null);
  };

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    const storedRol = localStorage.getItem("rol");

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
    }
  }, []);

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
