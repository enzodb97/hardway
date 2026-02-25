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
  userId: number | null; // ✅ ID del usuario autenticado
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  legajoPicker: string | null;
  loading: boolean; // ✅ Estado de carga durante validación
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
  userId: null, // ✅ ID del usuario por defecto
  showWelcome: false,
  setShowWelcome: () => {},
  legajoPicker: null,
  loading: true, // ✅ Por defecto en carga
  hasRole: () => false, // ✅ Función por defecto
  hasAnyRole: () => false, // ✅ Función por defecto
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log("🏗️ AuthProvider montándose...");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null); // @deprecated - mantener por compatibilidad
  const [roles, setRoles] = useState<string[]>([]); // ✅ NUEVO: Array de roles
  const [rolesIds, setRolesIds] = useState<number[]>([]); // ✅ NUEVO: Array de IDs
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // ✅ ID del usuario autenticado
  const [showWelcome, setShowWelcome] = useState(false);
  const [legajoPicker, setLegajoPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Estado de carga
  
  console.log("🔧 AuthProvider estado inicial - loading:", loading);

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

  // ✅ Expiración por inactividad (10 minutos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos en milisegundos
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      // Limpiar timer anterior
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Guardar timestamp de última actividad
      localStorage.setItem('lastActivity', new Date().getTime().toString());

      // Crear nuevo timer
      inactivityTimer = setTimeout(() => {
        console.log("⏱️ Sesión expirada por inactividad de 10 minutos");
        logout();
      }, INACTIVITY_TIME);
    };

    // Verificar si hay sesión expirada al cargar
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeSinceLastActivity = new Date().getTime() - parseInt(lastActivity);
      if (timeSinceLastActivity > INACTIVITY_TIME) {
        console.log("⏱️ Sesión expirada - última actividad hace más de 10 minutos");
        logout();
        return;
      }
    }

    // Eventos que resetean el timer de inactividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Iniciar timer
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated]);

  // ✅ NO limpiar en beforeunload - La sesión expira solo por inactividad o logout manual
  useEffect(() => {
    // Solo registrar el cierre para debugging
    const handleBeforeUnload = () => {
      console.log("ℹ️ Ventana cerrándose - La sesión expirará por inactividad de 10 minutos");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Configurar interceptor de axios una sola vez al inicio
  useEffect(() => {
    console.log("🚀 AuthContext: useEffect iniciado");
    let isMounted = true; // Para evitar actualizaciones después del desmontaje
    
    // ⚠️ FAILSAFE: Forzar desactivación del loading después de 2 segundos máximo
    const failsafeTimeout = setTimeout(() => {
      console.error("⚠️ FAILSAFE ACTIVADO: Forzando loading = false después de 2 segundos");
      if (isMounted) {
        setLoading(false);
      }
    }, 2000);
    
    const validateAuth = async () => {
      console.log("🔍 AuthContext: Iniciando validación de autenticación...");
      try {
        const authStatus = localStorage.getItem("isAuthenticated");
        const storedUsername = localStorage.getItem("username");
        const storedUserId = localStorage.getItem("idUsuario"); // ✅ ID del usuario
        let storedRol = localStorage.getItem("rol"); // deprecated - por compatibilidad
        const storedRoles = localStorage.getItem("roles"); // ✅ NUEVO
        const storedRolesIds = localStorage.getItem("rolesIds"); // ✅ NUEVO
        const storedLegajoPicker = localStorage.getItem("legajoPicker");
        
        console.log("📦 LocalStorage:", { authStatus, storedUsername, storedRol, storedRoles, tieneRoles: !!storedRoles });
        
        // Normaliza el valor del rol para pickers al recargar (mantener por compatibilidad)
        if (storedRol && storedRol.toLowerCase().includes("picker")) {
          storedRol = "Picker";
          localStorage.setItem("rol", "Picker");
        }
        
        if (authStatus === "true" && storedUsername && (storedRoles || storedRol)) {
          console.log("✅ Datos de sesión encontrados, validando con backend...");
          // Verifica con el backend si el usuario sigue siendo válido
          try {
            const res = await axiosInstance.get("/api/usuarios/validate", {
              params: { username: storedUsername },
              timeout: 3000 // Timeout de 3 segundos (menor que FAILSAFE)
            });
            
            console.log("📡 Respuesta del backend:", res.data);
            
            if (!isMounted) return;
            
            if (res.data.valid) {
              console.log("✅ Usuario validado correctamente");
              setIsAuthenticated(true);
              setRol(storedRol); // deprecated
              setUsername(storedUsername);
              setUserId(storedUserId ? parseInt(storedUserId) : null); // ✅ Cargar ID del usuario
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
              console.warn("⚠️ Usuario no válido, limpiando sesión");
              // Limpiar localStorage directamente
              localStorage.clear();
              setIsAuthenticated(false);
              setRol(null);
              setRoles([]);
              setRolesIds([]);
              setUsername(null);
              setUserId(null); // ✅ Limpiar ID del usuario
              setLegajoPicker(null);
            }
          } catch (error) {
            console.error("❌ AuthContext: Error en validación", error);
            // Limpiar localStorage directamente
            localStorage.clear();
            setIsAuthenticated(false);
            setRol(null);
            setRoles([]);
            setRolesIds([]);
            setUsername(null);
            setUserId(null); // ✅ Limpiar ID del usuario
            setLegajoPicker(null);
          }
        } else {
          console.log("ℹ️ No hay sesión guardada o datos incompletos");
          // No hay sesión guardada, limpiar todo
          if (!isMounted) return;
          setIsAuthenticated(false);
          setRol(null);
          setRoles([]);
          setRolesIds([]);
          setUsername(null);
          setUserId(null); // ✅ Limpiar ID del usuario
          localStorage.removeItem("legajoPicker");
        }
      } catch (error) {
        console.error("❌ AuthContext: Error crítico en validación", error);
        if (!isMounted) return;
        // Limpiar localStorage directamente
        localStorage.clear();
        setIsAuthenticated(false);
        setRol(null);
        setRoles([]);
        setRolesIds([]);
        setUsername(null);
        setUserId(null); // ✅ Limpiar ID del usuario
        setLegajoPicker(null);
      } finally {
        // ✅ SIEMPRE finalizar carga, sin importar qué pase
        console.log("🏁 FINALLY ejecutado - AuthContext: Finalizando validación, loading = false");
        clearTimeout(failsafeTimeout); // Cancelar el failsafe
        if (isMounted) {
          console.log("🔄 Llamando setLoading(false)...");
          setLoading(false);
          console.log("✅ setLoading(false) ejecutado");
        } else {
          console.warn("⚠️ Componente desmontado, no se actualiza loading");
        }
      }
    };
    
    validateAuth();
    
    return () => {
      isMounted = false; // Cleanup para evitar memory leaks
      clearTimeout(failsafeTimeout); // Limpiar timeout al desmontar
    };
  }, []);

  const login = async (usernameInput: string, password: string) => {
    setError(null);
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        nombreUsuario: usernameInput,
        contrasena: password,
      });
      
      // ✅ Guardar en localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("rol", response.data.tipoRol || response.data.roles?.[0] || ""); // deprecated - primer rol
      localStorage.setItem("roles", JSON.stringify(response.data.roles || [])); // ✅ NUEVO
      localStorage.setItem("rolesIds", JSON.stringify(response.data.rolesIds || [])); // ✅ NUEVO
      localStorage.setItem("username", response.data.nombreUsuario);
      localStorage.setItem("idUsuario", response.data.id.toString()); // ✅ Guardar ID del usuario
      localStorage.setItem("token", response.data.token); // ✅ Guardar token JWT
      
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
      setUserId(response.data.id || null); // ✅ Guardar ID del usuario en estado
      setLegajoPicker(response.data.legajoPicker || null);
      setShowWelcome(true); // Activa el mensaje tras login exitoso
      
      return true;
    } catch (error: any) {
      // Extraer el mensaje de error del backend
      const errorMsg = error?.response?.data?.error || "Credenciales inválidas";
      setError(errorMsg);
      setIsAuthenticated(false);
      setRol(null);
      setRoles([]); // ✅ NUEVO
      setRolesIds([]); // ✅ NUEVO
      setUsername(null);
      setUserId(null); // ✅ Limpiar ID del usuario
      setLegajoPicker(null);
      localStorage.removeItem("legajoPicker");
      return false;
    }
  };

  const logout = () => {
    console.log("🚪 Cerrando sesión y limpiando todos los datos...");
    
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Limpiar todas las cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Limpiar estados
    setIsAuthenticated(false);
    setRol(null);
    setRoles([]);
    setRolesIds([]);
    setUsername(null);
    setUserId(null); // ✅ Limpiar ID del usuario
    setLegajoPicker(null);
    setError(null);
    
    console.log("✅ Sesión cerrada y datos eliminados completamente");
  };

  console.log("🎁 AuthProvider renderizando con estado:", { loading, isAuthenticated, username });

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
        userId, // ✅ ID del usuario autenticado
        showWelcome,
        setShowWelcome,
        legajoPicker,
        loading, // ✅ NUEVO
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
