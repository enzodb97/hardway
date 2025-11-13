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
  rol: string | null; // @deprecated - Usar roles[] en su lugar
  roles: string[]; // ✅ NUEVO: Array de roles del usuario
  rolesIds: number[]; // ✅ NUEVO: Array de IDs de roles
  username: string | null;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  legajoPicker: string | null;
  // ✅ NUEVA función: Verificar si el usuario tiene un rol específico
  hasRole: (roleName: string) => boolean;
  // ✅ NUEVA función: Verificar si el usuario tiene alguno de los roles
  hasAnyRole: (roleNames: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  error: null,
  rol: null, // deprecated
  roles: [], // ✅ Array vacío por defecto
  rolesIds: [], // ✅ Array vacío por defecto
  username: null,
  showWelcome: false,
  setShowWelcome: () => {},
  legajoPicker: null,
  hasRole: () => false, // ✅ Función por defecto
  hasAnyRole: () => false, // ✅ Función por defecto
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null); // @deprecated - mantener por compatibilidad
  const [roles, setRoles] = useState<string[]>([]); // ✅ NUEVO: Array de roles
  const [rolesIds, setRolesIds] = useState<number[]>([]); // ✅ NUEVO: Array de IDs
  const [username, setUsername] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [legajoPicker, setLegajoPicker] = useState<string | null>(null);

  // ✅ NUEVA función: Verificar si el usuario tiene un rol específico
  const hasRole = (roleName: string): boolean => {
    return roles.some(r => r.toLowerCase() === roleName.toLowerCase());
  };

  // ✅ NUEVA función: Verificar si el usuario tiene alguno de los roles
  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => 
      roles.some(r => r.toLowerCase() === roleName.toLowerCase())
    );
  };

  // Configurar interceptor de axios una sola vez al inicio
  useEffect(() => {
    // Los interceptores ya están configurados en la instancia de axios
    // Solo necesitamos manejar la validación de usuario al cargar la app
    
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    let storedRol = localStorage.getItem("rol"); // deprecated - por compatibilidad
    const storedRoles = localStorage.getItem("roles"); // ✅ NUEVO
    const storedRolesIds = localStorage.getItem("rolesIds"); // ✅ NUEVO
    const storedLegajoPicker = localStorage.getItem("legajoPicker");
    
    // Normaliza el valor del rol para pickers al recargar (mantener por compatibilidad)
    if (storedRol && storedRol.toLowerCase().includes("picker")) {
      storedRol = "Picker";
      localStorage.setItem("rol", "Picker");
    }
    
    if (authStatus === "true" && storedUsername && (storedRoles || storedRol)) {
      // Verifica con el backend si el usuario sigue siendo válido
      axiosInstance
        .get("/api/usuarios/validate", {
          params: { username: storedUsername },
        })
        .then((res: any) => {
          if (res.data.valid) {
            setIsAuthenticated(true);
            setRol(storedRol); // deprecated
            setUsername(storedUsername);
            setLegajoPicker(storedLegajoPicker);
            
            // ✅ Cargar roles del localStorage o del response
            if (storedRoles) {
              try {
                setRoles(JSON.parse(storedRoles));
              } catch {
                setRoles(res.data.roles || []);
              }
            } else {
              setRoles(res.data.roles || []);
            }
            
            if (storedRolesIds) {
              try {
                setRolesIds(JSON.parse(storedRolesIds));
              } catch {
                setRolesIds([]);
              }
            }
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
      setRoles([]);
      setRolesIds([]);
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
      
      // ✅ Guardar en localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("rol", response.data.tipoRol || response.data.roles?.[0] || ""); // deprecated - primer rol
      localStorage.setItem("roles", JSON.stringify(response.data.roles || [])); // ✅ NUEVO
      localStorage.setItem("rolesIds", JSON.stringify(response.data.rolesIds || [])); // ✅ NUEVO
      localStorage.setItem("username", response.data.nombreUsuario);
      
      // Guarda el legajoPicker si existe
      if (response.data.legajoPicker) {
        localStorage.setItem("legajoPicker", response.data.legajoPicker);
      } else {
        localStorage.removeItem("legajoPicker");
      }
      
      // ✅ Actualizar estados
      setIsAuthenticated(true);
      setRol(response.data.tipoRol || response.data.roles?.[0] || ""); // deprecated - primer rol
      setRoles(response.data.roles || []); // ✅ NUEVO
      setRolesIds(response.data.rolesIds || []); // ✅ NUEVO
      setUsername(response.data.nombreUsuario);
      setLegajoPicker(response.data.legajoPicker || null);
      setShowWelcome(true); // Activa el mensaje tras login exitoso
      
      return true;
    } catch (error) {
      setError("Credenciales inválidas");
      setIsAuthenticated(false);
      setRol(null);
      setRoles([]); // ✅ NUEVO
      setRolesIds([]); // ✅ NUEVO
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
    setRoles([]); // ✅ NUEVO
    setRolesIds([]); // ✅ NUEVO
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
        rol, // deprecated - mantener por compatibilidad
        roles, // ✅ NUEVO
        rolesIds, // ✅ NUEVO
        username,
        showWelcome,
        setShowWelcome,
        legajoPicker,
        hasRole, // ✅ NUEVO
        hasAnyRole, // ✅ NUEVO
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
