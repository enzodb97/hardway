import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonMenuButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatFechaHoraCompleta } from "../utils/dateFormatters";
import { useEffect, useState } from "react";
import {
  peopleOutline,
  cartOutline,
  shirtOutline,
  statsChartOutline,
  cubeOutline,
  sendOutline,
  personCircleOutline,
  logOutOutline,
  timeOutline,
} from "ionicons/icons";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { logout, username, roles, hasAnyRole } = useAuth(); // ✅ Usar roles y hasAnyRole
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(formatFechaHoraCompleta());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 20) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  // ✅ Actualizar la hora cada segundo
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatFechaHoraCompleta());
      
      // También actualizar el saludo si cambia la hora
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Buenos días");
      else if (hour < 20) setGreeting("Buenas tardes");
      else setGreeting("Buenas noches");
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(intervalId); // Limpiar intervalo al desmontar
  }, []);

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  // Definir módulos según el rol
  const modules = [
    {
      title: "Clientes",
      description: "Gestión de clientes y registro",
      icon: peopleOutline,
      path: "/clientes",
      color: "primary",
      roles: ["Administrador", "Vendedor"],
    },
    {
      title: "Pedidos",
      description: "Gestión de pedidos y ventas",
      icon: cartOutline,
      path: "/pedidos",
      color: "secondary",
      roles: ["Administrador", "Encargado de Pedidos"],
    },
    {
      title: "Indumentaria",
      description: "Gestión de productos y stock",
      icon: shirtOutline,
      path: "/indumentaria",
      color: "tertiary",
      roles: ["Administrador", "Encargado de Stock"],
    },
    {
      title: "Picking",
      description: "Preparación de pedidos",
      icon: cubeOutline,
      path: "/picking",
      color: "warning",
      roles: ["Picker", "Administrador"],
    },
    {
      title: "Envíos",
      description: "Gestión de despachos",
      icon: sendOutline,
      path: "/envios",
      color: "success",
      roles: ["Administrador", "Envios", "Picker"],
    },
    {
      title: "Reportes",
      description: "Análisis y estadísticas",
      icon: statsChartOutline,
      path: "/reportes",
      color: "danger",
      roles: ["Administrador", "Gerente General"],
    },
    {
      title: "Usuarios",
      description: "Gestión de usuarios del sistema",
      icon: personCircleOutline,
      path: "/usuarios",
      color: "medium",
      roles: ["Administrador"],
    },
  ];

  // ✅ Filtrar módulos según los roles del usuario (si tiene ALGUNO de los roles)
  const availableModules = modules.filter((module) =>
    module.roles.some(requiredRole => 
      roles.some(userRole => userRole.toLowerCase() === requiredRole.toLowerCase())
    )
  );

  return (
    <IonPage className="dashboard-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Dashboard</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={handleLogout}
            className="header-logout-btn"
          >
            <IonIcon icon={logOutOutline} slot="icon-only" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        {/* Header de bienvenida */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1 className="welcome-title">
              {greeting}, {username}
            </h1>
            <p className="welcome-subtitle">
              Sistema de Gestión Integral
            </p>
            {/* ✅ Mostrar todos los roles del usuario */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {roles.map((role, index) => (
                <IonBadge key={index} color="primary" className="role-badge">
                  {role}
                </IonBadge>
              ))}
            </div>
          </div>
          <div className="welcome-time">
            <IonIcon icon={timeOutline} />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Módulos disponibles */}
        <div className="dashboard-modules">
          <h2 className="modules-title">Accesos Rápidos</h2>
          <IonGrid>
            <IonRow>
              {availableModules.map((module, index) => (
                <IonCol
                  key={index}
                  size="12"
                  sizeMd="6"
                  sizeLg="4"
                  sizeXl="3"
                >
                  <IonCard
                    className="module-card"
                    button
                    onClick={() => history.push(module.path)}
                  >
                    <IonCardHeader>
                      <div className="card-icon-container">
                        <IonIcon
                          icon={module.icon}
                          className={`card-icon color-${module.color}`}
                        />
                      </div>
                      <IonCardTitle className="card-title">
                        {module.title}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p className="card-description">{module.description}</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>

        {/* Footer info */}
        <div className="dashboard-footer">
          <p>Sistema de Gestión Integral de Pedidos e Inventario</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
