import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  FC,
} from "react";
import axiosInstance from "../config/axios";

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
  const [legajoPicker, setLegajoPicker] = useState<string | null>(null);

  // Configurar interceptor de axios una sola vez al inicio
  useEffect(() => {
    // Los interceptores ya están configurados en la instancia de axios
    // Solo necesitamos manejar la validación de usuario al cargar la app
    
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    let storedRol = localStorage.getItem("rol");
    const storedLegajoPicker = localStorage.getItem("legajoPicker");
    
    // Normaliza el valor del rol para pickers al recargar
    if (storedRol && storedRol.toLowerCase().includes("picker")) {
      storedRol = "Picker";
      localStorage.setItem("rol", "Picker");
    }
    
    if (authStatus === "true" && storedUsername && storedRol) {
      // Verifica con el backend si el usuario sigue siendo válido
      axiosInstance
        .get("/api/usuarios/validate", {
          params: { username: storedUsername },
        })
        .then((res: any) => {
          if (res.data.valid) {
            setIsAuthenticated(true);
            setRol(storedRol);
            setUsername(storedUsername);
            setLegajoPicker(storedLegajoPicker);
          } else {
            // Si no es válido, forzar logout
            logout();
          }
        })
        .catch((error) => {
          console.error("AuthContext: Error en validación", error);
          logout();
        });
    } else {
      setIsAuthenticated(false);
      setRol(null);
      setUsername(null);
      localStorage.removeItem("legajoPicker");
    }
  }, []);

  const login = async (usernameInput: string, password: string) => {
    setError(null);
    try {
      const response = await axiosInstance.post("/api/login", {
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
      setLegajoPicker(response.data.legajoPicker || null);
      setShowWelcome(true); // Activa el mensaje tras login exitoso
      return true;
    } catch (error) {
      setError("Credenciales inválidas");
      setIsAuthenticated(false);
      setRol(null);
      setUsername(null);
      setLegajoPicker(null);
      localStorage.removeItem("legajoPicker");
      return false;
    }
  };

  const logout = () => {
    localStorage.clear(); // Borra todo el localStorage
    setIsAuthenticated(false);
    setRol(null);
    setUsername(null);
    setLegajoPicker(null);
  };

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
        legajoPicker,
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
