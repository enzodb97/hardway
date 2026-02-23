// src/pages/Pedidos/AltaPedido.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert,
  IonMenuButton,
  IonModal,
  IonList,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  useIonViewWillEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import {
  person,
  shirt,
  list,
  shirtOutline,
  add,
  arrowBack,
  checkmark,
  save,
  carOutline,
  close,
  radioButtonOn,
  radioButtonOff,
} from "ionicons/icons";
import { useHistory, useParams, useLocation } from "react-router-dom";
import {
  crearPedido,
  editarPedido,
  obtenerMotivosModificacion,
} from "../../utils/pedidosUtils";
import { useClientesVip } from "../../utils/useClientesVip";
import axiosInstance from "../../config/axios";
import { obtenerConfiguracionesPorProducto } from "../../services/presentacionesService";
import "./AltaPedido.css";
import zepelin from "../../assets/images/zepelin.png";
import { useClientes, Cliente } from "../../context/ClientesContext";

// --- Tipo para el pedido ---
type PedidoInput = {
  descripcion: string;
  fecha: string;
  estado: string;
  clienteId: number;
  indumentaria: { idIndumentaria: number; cantidad: number }[];
};

const estadoInicial = {
  idCliente: "",
  clienteNombre: "",
  idEstado: "", // si quieres permitir elegir estado
};

const AltaPedido: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const location = useLocation();

  const { clientes } = useClientes();
  const { vipIds } = useClientesVip();

  // ...estados...

  const [form, setForm] = useState(estadoInicial);
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<
    {
      codigoIndumentaria: string;
      nombre: string;
      color: string;
      talle: string;
      nombreTela: string;
      cantidad: number;
      idPresentacion?: number;
      cantidadPresentaciones?: number;
      unidadesTotales?: number;
      nombrePresentacion?: string;
    }[]
  >([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const esEdicion = Boolean(id);

  // --- Indumentaria ---
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [showIndumentariaModal, setShowIndumentariaModal] = useState(false);
  const [filtroIndumentaria, setFiltroIndumentaria] = useState("");

  // --- Presentaciones ---
  const [configuracionesPorProducto, setConfiguracionesPorProducto] = useState<
    Map<string, any[]>
  >(new Map());
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState<
    Map<string, number>
  >(new Map());
  const [cantidadPresentaciones, setCantidadPresentaciones] = useState<
    Map<string, number>
  >(new Map());

  // --- Empresas de Envío ---
  const [empresasEnvio, setEmpresasEnvio] = useState<
    { idEmpresaEnvio: number; nombre: string }[]
  >([]);
  const [empresaEnvioSeleccionada, setEmpresaEnvioSeleccionada] =
    useState<string>("");

  // --- Motivo de Modificación (solo para edición) ---
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [motivosModificacion, setMotivosModificacion] = useState<
    Array<{ idMotivo: number; descripcion: string }>
  >([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [datosPendientesEdicion, setDatosPendientesEdicion] =
    useState<any>(null);

  // Calcular total y descuento si corresponde (después de los estados)
  const esVip = form.idCliente && vipIds.has(Number(form.idCliente));
  
  // Calcular totales y descuentos por presentación
  let totalSinDescuentos = 0;
  let descuentoPacks = 0;
  let descuentoCajasCerradas = 0;
  
  const totalPedido = prendasSeleccionadas.reduce((acc, prenda) => {
    // Buscar precio de la prenda en el catálogo
    const prendaCat = indumentaria.find(
      (i) => i.codigoIndumentaria === prenda.codigoIndumentaria
    );
    const precioOriginal = prendaCat ? prendaCat.precio : 0;
    const subtotalOriginal = precioOriginal * prenda.cantidad;
    totalSinDescuentos += subtotalOriginal;
    
    let precio = precioOriginal;
    
    // Aplicar descuentos por tipo de presentación
    // idPresentacion: 1=Unidad, 2=Caja Cerrada, 3=Pack
    const idPres = prenda.idPresentacion || 1;
    if (idPres === 3) {
      // Pack: 5% de descuento
      const descuento = subtotalOriginal * 0.05;
      descuentoPacks += descuento;
      precio = precio * 0.95;
    } else if (idPres === 2) {
      // Caja Cerrada: 10% de descuento
      const descuento = subtotalOriginal * 0.10;
      descuentoCajasCerradas += descuento;
      precio = precio * 0.90;
    }
    
    return acc + precio * prenda.cantidad;
  }, 0);
  
  // Descuento VIP se aplica sobre el subtotal original (antes de descuentos de presentación)
  const descuento = esVip ? totalSinDescuentos * 0.1 : 0;
  const totalConDescuento = totalPedido - descuento;

  // Limpiar formulario y prendas SIEMPRE al entrar a la página de alta
  useEffect(() => {
    if (!esEdicion) {
      setForm({
        ...estadoInicial,
      });
      setPrendasSeleccionadas([]);
      setEmpresaEnvioSeleccionada(""); // Limpiar empresa de envío
      setConfiguracionesPorProducto(new Map());
      setPresentacionSeleccionada(new Map());
      setCantidadPresentaciones(new Map());
      // Limpiar estados de carga de pedidos para evitar que se procesen datos antiguos
      setDatosDelPedido(null);
      setPrendasCargadasDesdeServidor(false);
    }
    // eslint-disable-next-line
  }, [location.pathname, esEdicion]);

  // Función para cargar indumentaria
  const cargarIndumentaria = async () => {
    try {
      const res = await axiosInstance.get("/api/indumentaria");
      // Mapear datos anidados del backend a estructura plana
      const indumentariaMapeada = res.data.map((item: any) => ({
        codigoIndumentaria: item.codigoIndumentaria,
        nombre:
          item.DetalleIndumentarium?.NombreIndumentarium?.nombre ||
          "Sin nombre",
        color: item.DetalleIndumentarium?.Color?.color || "Sin color",
        nombreTela:
          item.DetalleIndumentarium?.TelaIndumentarium?.tipoTela || "Sin tela",
        talle: item.DetalleIndumentarium?.Talle?.talle || "Sin talle",
        categoria:
          item.DetalleIndumentarium?.CategoriaIndumentarium?.categoria ||
          "Sin categoría",
        precio: parseFloat(
          item.DetalleIndumentarium?.PrecioIndumentarium?.precio || "0"
        ),
        estado:
          item.DetalleIndumentarium?.EstadoIndumentarium?.estadoIndumentaria ||
          "Sin estado",
        cantidadIndumentaria:
          item.DetalleIndumentarium?.cantidadIndumentaria || 0,
        idIndumentaria: item.idDetalle,
      }));
      setIndumentaria(indumentariaMapeada);
    } catch (error) {
      console.error("Error al cargar indumentaria:", error);
    }
  };

  // Cargar configuraciones de presentación para un producto
  const cargarConfiguracionesProducto = async (codigoIndumentaria: string) => {
    try {
      const configuraciones = await obtenerConfiguracionesPorProducto(
        codigoIndumentaria
      );
      setConfiguracionesPorProducto((prev) => {
        const newMap = new Map(prev);
        newMap.set(codigoIndumentaria, configuraciones);
        return newMap;
      });

      // Establecer presentación por defecto (Unidad = 1)
      if (configuraciones.length > 0) {
        setPresentacionSeleccionada((prev) => {
          const newMap = new Map(prev);
          newMap.set(codigoIndumentaria, 1);
          return newMap;
        });
        setCantidadPresentaciones((prev) => {
          const newMap = new Map(prev);
          newMap.set(codigoIndumentaria, 1);
          return newMap;
        });
      }
    } catch (error) {
      console.error("Error al cargar configuraciones de presentación:", error);
    }
  };

  // Cargar indumentaria al montar el componente
  useEffect(() => {
    cargarIndumentaria();
  }, []);

  // Cargar empresas de envío
  useEffect(() => {
    const cargarEmpresasEnvio = async () => {
      try {
        const resEmpresas = await axiosInstance.get(
          "/api/auxiliares/empresas-envio"
        );
        setEmpresasEnvio(resEmpresas.data);
      } catch (error) {
        console.error("Error al cargar empresas de envío:", error);
        setAlertMsg("Error al cargar las empresas de envío");
        setShowAlert(true);
      }
    };
    cargarEmpresasEnvio();
  }, []);

  // Cargar motivos de modificación (solo si es edición)
  useEffect(() => {
    if (esEdicion) {
      const cargarMotivos = async () => {
        try {
          const motivos = await obtenerMotivosModificacion();
          console.log("🔍 Motivos de modificación cargados:", motivos);
          setMotivosModificacion(motivos);
        } catch (error) {
          console.error("❌ Error al cargar motivos de modificación:", error);
        }
      };
      cargarMotivos();
    }
  }, [esEdicion]);

  // Almacenar datos de pedido para procesamiento posterior
  const [datosDelPedido, setDatosDelPedido] = useState<any>(null);
  const [prendasCargadasDesdeServidor, setPrendasCargadasDesdeServidor] =
    useState(false);

  // Función para cargar datos del pedido (reutilizable)
  const cargarDatosPedido = async () => {
    if (!esEdicion || !id) return;

    try {
      const res = await axiosInstance.get(`/api/pedidos/${id}`);
      setForm({
        idCliente: res.data.idCliente?.toString() || "",
        clienteNombre: res.data.Cliente?.Persona
          ? `${res.data.Cliente.Persona.nombre} ${
              res.data.Cliente.Persona.apellido ?? ""
            }`.trim()
          : "",
        idEstado: res.data.idEstado?.toString() || "",
      });

      // Cargar empresa de envío
      if (res.data.idEmpresaEnvio) {
        setEmpresaEnvioSeleccionada(res.data.idEmpresaEnvio.toString());
      }

      // Guardar los datos del pedido para procesarlos cuando tengamos el catálogo
      if (res.data.DetallePedidos) {
        setDatosDelPedido(res.data.DetallePedidos);
        // Resetear la bandera para permitir que se carguen las prendas
        setPrendasCargadasDesdeServidor(false);
      }
    } catch (error: any) {
      console.error("Error al cargar el pedido:", error);
      if (error.response?.status === 401) {
        setAlertMsg(
          "Error de autenticación. Por favor, inicie sesión nuevamente."
        );
      } else if (error.response?.status === 404) {
        setAlertMsg("Pedido no encontrado.");
      } else if (error.response?.data?.error) {
        setAlertMsg(`Error: ${error.response.data.error}`);
      } else {
        setAlertMsg("Error al cargar el pedido.");
      }
      setShowAlert(true);
    }
  };

  // Cargar datos cuando se entra a la vista (navegación Ionic)
  useIonViewWillEnter(() => {
    if (esEdicion && id) {
      cargarDatosPedido();
      cargarIndumentaria();
    } else {
      // Limpiar completamente el formulario cuando NO es edición
      setForm({
        ...estadoInicial,
      });
      setPrendasSeleccionadas([]);
      setEmpresaEnvioSeleccionada("");
      setConfiguracionesPorProducto(new Map());
      setPresentacionSeleccionada(new Map());
      setCantidadPresentaciones(new Map());
      setFiltroCliente("");
      setFiltroIndumentaria("");
      // Limpiar estados de carga de pedidos
      setDatosDelPedido(null);
      setPrendasCargadasDesdeServidor(false);
      cargarIndumentaria();
    }
  });

  // Limpiar cuando se SALE de la vista (crítico para Ionic)
  useIonViewDidLeave(() => {
    if (!esEdicion) {
      setPrendasSeleccionadas([]);
      setForm({...estadoInicial});
      setEmpresaEnvioSeleccionada("");
      setConfiguracionesPorProducto(new Map());
      setPresentacionSeleccionada(new Map());
      setCantidadPresentaciones(new Map());
      setDatosDelPedido(null);
      setPrendasCargadasDesdeServidor(false);
    }
  });

  // Cargar datos cuando cambia la ubicación (redirecciones)
  useEffect(() => {
    if (esEdicion && id && location.pathname.includes(`/alta-pedido/${id}`)) {
      cargarDatosPedido();
    }
  }, [location, esEdicion, id]);

  // Cargar datos si es edición (mantener para compatibilidad)
  useEffect(() => {
    if (esEdicion && id) {
      cargarDatosPedido();
    }
    // eslint-disable-next-line
  }, [id, esEdicion]);

  // Procesar las prendas cuando tengamos tanto los datos del pedido como el catálogo de indumentaria
  // SOLO la primera vez que se cargan los datos del servidor
  useEffect(() => {
    // Solo ejecutar si tenemos datos del pedido, catálogo de indumentaria,
    // y NO hemos cargado las prendas desde el servidor todavía
    // Y ADEMÁS estamos en modo edición
    if (
      esEdicion &&
      datosDelPedido &&
      indumentaria.length > 0 &&
      !prendasCargadasDesdeServidor
    ) {
      const prendasDelPedido = datosDelPedido.map((detalle: any) => {
        // Buscamos en el catálogo la información completa de esta indumentaria
        const indumentariaEnCatalogo = indumentaria.find(
          (item) => item.codigoIndumentaria === detalle.codigoIndumentaria
        );

        // Obtener nombre de presentación si existe (usando el alias "Presentacion")
        const nombrePresentacion = detalle.Presentacion?.nombrePresentacion || "Unidad";

        // Si la encontramos en el catálogo, usamos los datos más completos
        if (indumentariaEnCatalogo) {
          return {
            codigoIndumentaria: detalle.codigoIndumentaria,
            nombre: indumentariaEnCatalogo.nombre || "Sin nombre",
            color: indumentariaEnCatalogo.color || "Sin color",
            talle: indumentariaEnCatalogo.talle || "Sin talle",
            nombreTela: indumentariaEnCatalogo.nombreTela || "Sin tela",
            cantidad: detalle.unidadesTotales || detalle.cantidad,
            // Datos de presentación
            idPresentacion: detalle.idPresentacion || 1,
            cantidadPresentaciones: detalle.cantidadPresentaciones || detalle.cantidad,
            unidadesTotales: detalle.unidadesTotales || detalle.cantidad,
            nombrePresentacion: nombrePresentacion,
          };
        } else {
          // Si no está en el catálogo, usamos los datos del detalle
          return {
            codigoIndumentaria: detalle.codigoIndumentaria,
            nombre:
              detalle.Indumentarium?.DetalleIndumentarium?.NombreIndumentarium
                ?.nombre ||
              detalle.codigoIndumentaria ||
              "Sin nombre",
            color:
              detalle.Indumentarium?.DetalleIndumentarium?.Color?.color ||
              "Sin color",
            talle:
              detalle.Indumentarium?.DetalleIndumentarium?.Talle?.talle ||
              "Sin talle",
            nombreTela:
              detalle.Indumentarium?.DetalleIndumentarium?.TelaIndumentarium
                ?.tipoTela || "Sin tela",
            cantidad: detalle.unidadesTotales || detalle.cantidad,
            // Datos de presentación
            idPresentacion: detalle.idPresentacion || 1,
            cantidadPresentaciones: detalle.cantidadPresentaciones || detalle.cantidad,
            unidadesTotales: detalle.unidadesTotales || detalle.cantidad,
            nombrePresentacion: nombrePresentacion,
          };
        }
      });

      setPrendasSeleccionadas(prendasDelPedido);
      // Marcar que ya hemos cargado las prendas desde el servidor
      setPrendasCargadasDesdeServidor(true);
    }
    // eslint-disable-next-line
  }, [datosDelPedido, indumentaria, esEdicion, prendasCargadasDesdeServidor]);

  // --- Función helper para obtener unidades originales del pedido ---
  const obtenerUnidadesOriginalesPedido = (codigoIndumentaria: string): number => {
    if (!esEdicion || !datosDelPedido) return 0;
    
    // Sumar TODAS las líneas del mismo producto (puede haber múltiples presentaciones)
    const totalUnidadesOriginales = datosDelPedido
      .filter((detalle: any) => detalle.codigoIndumentaria === codigoIndumentaria)
      .reduce((total: number, detalle: any) => {
        return total + (detalle.unidadesTotales || detalle.cantidad || 0);
      }, 0);
    
    return totalUnidadesOriginales;
  };

  // --- Lógica de prendas ---
  const agregarPrenda = (
    prenda: any,
    cantidad: number,
    presentacion?: {
      idPresentacion: number;
      cantidadPresentaciones: number;
      unidadesTotales: number;
      nombrePresentacion: string;
    }
  ) => {
    // Validar si ya existe la combinación de indumentaria + presentación
    const idPresentacionActual = presentacion?.idPresentacion || 1;
    const yaExiste = prendasSeleccionadas.some(
      (p) => 
        p.codigoIndumentaria === prenda.codigoIndumentaria &&
        (p.idPresentacion || 1) === idPresentacionActual
    );

    if (yaExiste) {
      const nombrePres = presentacion?.nombrePresentacion || "Unidad";
      setAlertMsg(
        `Ya has agregado esta indumentaria con presentación "${nombrePres}". ` +
        `Puedes modificar la cantidad en la lista de prendas o eliminarla.`
      );
      setShowAlert(true);
      return;
    }

    // Calcular unidades totales ya agregadas de esta indumentaria (todas las presentaciones)
    const unidadesYaAgregadas = prendasSeleccionadas
      .filter(p => p.codigoIndumentaria === prenda.codigoIndumentaria)
      .reduce((total, p) => total + (p.unidadesTotales || p.cantidad), 0);

    // La cantidad a verificar depende si hay presentación o no
    const cantidadAVerificar = presentacion
      ? presentacion.unidadesTotales
      : cantidad;

    // Validar stock total (lo ya agregado + lo nuevo)
    const totalUnidades = unidadesYaAgregadas + cantidadAVerificar;
    
    // Calcular stock ajustado considerando unidades del pedido original si es edición
    const unidadesOriginales = obtenerUnidadesOriginalesPedido(prenda.codigoIndumentaria);
    const stockAjustado = prenda.cantidadIndumentaria + unidadesOriginales;

    if (totalUnidades > stockAjustado) {
      const mensajeBase = `Stock insuficiente. Ya tienes ${unidadesYaAgregadas} unidades agregadas en otras presentaciones. ` +
        `Intentas agregar ${cantidadAVerificar} más pero solo hay ${stockAjustado} disponibles en total`;
      
      const mensajeDetalle = esEdicion && unidadesOriginales > 0
        ? ` (${prenda.cantidadIndumentaria} en stock + ${unidadesOriginales} del pedido original)`
        : '';
      
      setAlertMsg(
        mensajeBase + mensajeDetalle + `. ` +
        `Puedes agregar máximo ${stockAjustado - unidadesYaAgregadas} unidades adicionales.`
      );
      setShowAlert(true);
      return;
    }

    setPrendasSeleccionadas((prev) => [
      ...prev,
      {
        codigoIndumentaria: prenda.codigoIndumentaria,
        nombre: prenda.nombre,
        color: prenda.color || "Sin color",
        talle: prenda.talle || "Sin talle",
        nombreTela: prenda.nombreTela || "Sin tela",
        cantidad: presentacion ? presentacion.unidadesTotales : cantidad,
        idPresentacion: presentacion?.idPresentacion || 1,
        cantidadPresentaciones:
          presentacion?.cantidadPresentaciones || cantidad,
        unidadesTotales: presentacion?.unidadesTotales || cantidad,
        nombrePresentacion: presentacion?.nombrePresentacion || "Unidad",
      },
    ]);
    // Limpiar la cantidad temporal de la prenda agregada
    delete prenda._cantidadTemp;
    setShowIndumentariaModal(false);
    setFiltroIndumentaria("");
  };

  const eliminarPrenda = (codigoIndumentaria: string, idPresentacion?: number) => {
    setPrendasSeleccionadas((prev) =>
      prev.filter((p) => 
        !(p.codigoIndumentaria === codigoIndumentaria && 
          (p.idPresentacion || 1) === (idPresentacion || 1))
      )
    );
  };

  // --- Envío del formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idCliente) {
      setAlertMsg("Debe agregar un cliente");
      setShowAlert(true);
      return;
    }

    // Validar que el cliente esté activo
    const validacion = validarClienteActivo(Number(form.idCliente));
    if (!validacion.esValido) {
      setAlertMsg(validacion.mensaje);
      setShowAlert(true);
      return;
    }

    if (prendasSeleccionadas.length === 0) {
      setAlertMsg("Debes agregar al menos un producto al pedido.");
      setShowAlert(true);
      return;
    }

    // Validación final de stock: verificar que ninguna indumentaria exceda el stock disponible
    const erroresStock: string[] = [];
    
    // Agrupar prendas por código de indumentaria para validar stock total
    const prendasPorCodigo = prendasSeleccionadas.reduce((acc, prenda) => {
      const codigo = prenda.codigoIndumentaria;
      if (!acc[codigo]) {
        acc[codigo] = [];
      }
      acc[codigo].push(prenda);
      return acc;
    }, {} as Record<string, typeof prendasSeleccionadas>);

    // Validar cada indumentaria
    for (const [codigoIndumentaria, prendas] of Object.entries(prendasPorCodigo)) {
      const totalUnidades = prendas.reduce(
        (total, p) => total + (p.unidadesTotales || p.cantidad), 
        0
      );
      
      const prendaCatalogo = indumentaria.find(
        i => i.codigoIndumentaria === codigoIndumentaria
      );
      
      if (prendaCatalogo) {
        // Calcular stock ajustado considerando unidades del pedido original si es edición
        const unidadesOriginales = obtenerUnidadesOriginalesPedido(codigoIndumentaria);
        const stockDisponible = prendaCatalogo.cantidadIndumentaria + unidadesOriginales;
        
        // Logging de debug para ediciones
        if (esEdicion && unidadesOriginales > 0) {
          console.log(`📦 Validación de stock para ${prendaCatalogo.nombre}:`, {
            esEdicion,
            stockActual: prendaCatalogo.cantidadIndumentaria,
            unidadesOriginales,
            stockDisponible,
            totalUnidadesSolicitadas: totalUnidades,
            esValido: totalUnidades <= stockDisponible
          });
        }
        
        if (totalUnidades > stockDisponible) {
          const mensajeBase = `${prendaCatalogo.nombre}: intentas pedir ${totalUnidades} unidades pero solo hay ${stockDisponible} disponibles`;
          const mensajeDetalle = esEdicion && unidadesOriginales > 0
            ? ` (${prendaCatalogo.cantidadIndumentaria} en stock + ${unidadesOriginales} del pedido original)`
            : '';
          
          erroresStock.push(mensajeBase + mensajeDetalle);
        }
      }
    }

    if (erroresStock.length > 0) {
      setAlertMsg(
        "Stock insuficiente para los siguientes productos:\n\n" + 
        erroresStock.join("\n")
      );
      setShowAlert(true);
      return;
    }

    // Validar que se haya seleccionado una empresa de envío
    if (!empresaEnvioSeleccionada) {
      setAlertMsg("Debe seleccionar una empresa de envío");
      setShowAlert(true);
      return;
    }

    const pedido = {
      idCliente: Number(form.idCliente),
      idEstado: 1,
      prendas: prendasSeleccionadas.map((prenda) => ({
        codigoIndumentaria: prenda.codigoIndumentaria,
        cantidad: prenda.cantidad,
        idPresentacion: prenda.idPresentacion || 1,
        cantidadPresentaciones:
          prenda.cantidadPresentaciones || prenda.cantidad,
        unidadesTotales: prenda.unidadesTotales || prenda.cantidad,
      })),
      total: totalConDescuento,
      descuento: descuento,
      esVip: esVip,
      idEmpresaEnvio: Number(empresaEnvioSeleccionada),
    };

    // Si es edición, mostrar modal de motivo antes de guardar
    if (esEdicion && id) {
      setDatosPendientesEdicion(pedido);

      // Cargar motivos antes de abrir el modal (por si no se cargaron antes)
      try {
        const motivos = await obtenerMotivosModificacion();
        console.log("🔍 Motivos antes de abrir modal:", motivos);
        console.log("📊 Cantidad de motivos:", motivos.length);
        setMotivosModificacion(motivos);
      } catch (error) {
        console.error("❌ Error al cargar motivos:", error);
        setAlertMsg("Error al cargar los motivos de modificación");
        setShowAlert(true);
        return;
      }

      setShowMotivoModal(true);
    } else {
      // Si es creación, guardar directamente
      await procesarCreacionPedido(pedido);
    }
  };

  // Función para procesar la creación del pedido
  const procesarCreacionPedido = async (pedido: any) => {
    try {
      await crearPedido(pedido);
      await cargarIndumentaria();
      setShowSuccess(true);
    } catch (error) {
      setAlertMsg("Error al crear el pedido.");
      setShowAlert(true);
    }
  };

  // Función para procesar la edición del pedido (después de seleccionar motivo)
  const procesarEdicionPedido = async () => {
    if (!motivoSeleccionado) {
      setAlertMsg("Debe seleccionar un motivo de modificación");
      setShowAlert(true);
      return;
    }

    try {
      const datosConMotivo = {
        ...datosPendientesEdicion,
        idMotivo: Number(motivoSeleccionado),
        observaciones: observaciones || null,
      };

      console.log("📝 Guardando edición con motivo:", datosConMotivo);

      await editarPedido(id!, datosConMotivo);
      await cargarIndumentaria();

      // Limpiar estados del modal
      setShowMotivoModal(false);
      setMotivoSeleccionado("");
      setObservaciones("");
      setDatosPendientesEdicion(null);

      setShowSuccess(true);
    } catch (error) {
      console.error("Error al editar el pedido:", error);
      setAlertMsg("Error al editar el pedido.");
      setShowAlert(true);
    }
  };

  // --- Filtro de clientes ---
  const clientesFiltrados = (clientes ?? []).filter((c) => {
    if (!c || (typeof c.nombre !== "string" && typeof c.apellido !== "string"))
      return false; // Evita elementos undefined o sin nombre/apellido string
    const normalizar = (str: string) =>
      (str ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const nombreCompleto = `${c.nombre || ""} ${c.apellido || ""}`;
    const nombreCompletoNormalizado = normalizar(nombreCompleto);
    const filtroNorm = normalizar(filtroCliente);

    return (
      normalizar(c.nombre || "").includes(filtroNorm) ||
      normalizar(c.apellido || "").includes(filtroNorm) ||
      nombreCompletoNormalizado.includes(filtroNorm) ||
      (c.numeroDocumento &&
        c.numeroDocumento.toString().includes(filtroCliente))
    );
  });

  // --- Validación de cliente activo ---
  const validarClienteActivo = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return { esValido: false, mensaje: "Cliente no encontrado" };
    }
    if (cliente.estaActivo === 0) {
      return {
        esValido: false,
        mensaje: `El cliente ${cliente.nombre} ${
          cliente.apellido || ""
        } está dado de baja, no se le puede asignar un pedido.`.trim(),
      };
    }
    return { esValido: true, mensaje: "" };
  };

  // --- Función para seleccionar cliente ---
  const seleccionarCliente = (cliente: Cliente) => {
    const validacion = validarClienteActivo(cliente.id);
    if (!validacion.esValido) {
      setAlertMsg(validacion.mensaje);
      setShowAlert(true);
      return;
    }

    setForm({
      ...form,
      idCliente: cliente.id.toString(),
      clienteNombre: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    });
    setShowClienteModal(false);
  };

  return (
    <IonPage className="alta-pedido-page">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>{esEdicion ? `Editar Pedido` : "Nuevo Pedido"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="alta-pedido-content">
        <div className="form-container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <img src={zepelin} alt="Hardway Logo" className="brand-logo" />
              <h1 className="hero-title">
                {esEdicion ? `Editar Pedido #${id}` : " Crear Nuevo Pedido"}
              </h1>
              <p className="hero-subtitle">
                {esEdicion
                  ? "Modifica los detalles del pedido existente"
                  : "Registra un nuevo pedido para tu cliente"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Card de Cliente */}
              <div className="form-card cliente-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <IonIcon icon={person} />
                    Información del Cliente
                  </h3>
                  <p className="card-subtitle">
                    Selecciona el cliente para este pedido
                  </p>
                </div>
                <div className="card-content">
                  <IonItem
                    className={`form-item ${esEdicion ? "disabled" : ""}`}
                    button={!esEdicion}
                    onClick={
                      esEdicion ? undefined : () => setShowClienteModal(true)
                    }
                  >
                    <IonLabel position="floating">Cliente</IonLabel>
                    <IonInput
                      value={form.clienteNombre}
                      placeholder={
                        esEdicion
                          ? "Cliente del pedido"
                          : "Toca para seleccionar un cliente"
                      }
                      readonly
                      required
                    />
                  </IonItem>
                  {form.idCliente && (
                    <IonItem className="form-item">
                      <IonLabel position="floating">ID del Cliente</IonLabel>
                      <IonInput value={form.idCliente} readonly />
                    </IonItem>
                  )}

                  {/* Select de Empresa de Envío */}
                  <IonItem className="form-item empresa-envio-item">
                    <IonIcon
                      icon={carOutline}
                      slot="start"
                      style={{ marginRight: "8px", color: "#fdb40b" }}
                    />
                    <IonLabel position="floating">Empresa de Envío</IonLabel>
                    <IonSelect
                      value={empresaEnvioSeleccionada}
                      placeholder="Seleccione una empresa"
                      onIonChange={(e: CustomEvent) =>
                        setEmpresaEnvioSeleccionada(e.detail.value!)
                      }
                      interface="popover"
                    >
                      {empresasEnvio.map((empresa) => (
                        <IonSelectOption
                          key={empresa.idEmpresaEnvio}
                          value={empresa.idEmpresaEnvio.toString()}
                        >
                          {empresa.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </div>
              </div>

              {/* Card de Prendas */}
              <div className="form-card full-width">
                <div className="card-header">
                  <h3 className="card-title">
                    <IonIcon icon={shirt} />
                    Indumentaria del Pedido
                  </h3>
                  <p className="card-subtitle">
                    Agrega las Indumentarias que incluirá este pedido
                  </p>
                </div>
                <div className="card-content">
                  <div className="prendas-header">
                    <div className="prendas-title">
                      <IonIcon icon={list} />
                      Indumentarias Seleccionadas
                    </div>
                    <div className="prendas-counter">
                      {prendasSeleccionadas.length}{" "}
                      {prendasSeleccionadas.length === 1
                        ? "indumentaria"
                        : "indumentaria"}
                    </div>
                  </div>

                  {prendasSeleccionadas.length === 0 ? (
                    <div className="empty-state">
                      <IonIcon icon={shirtOutline} className="empty-icon" />
                      <h4 className="empty-title">
                        No hay indumentarias agregadas
                      </h4>
                      <p className="empty-description">
                        Haz clic en "Agregar Indumentria" para comenzar a
                        construir tu pedido
                      </p>
                    </div>
                  ) : (
                    <div className="prendas-list" key={`prendas-${prendasSeleccionadas.length}-${Date.now()}`}>
                      {prendasSeleccionadas.map((prenda, index) => (
                        <div
                          key={`${prenda.codigoIndumentaria}-${prenda.idPresentacion || 1}-${index}`}
                          className="prenda-card"
                        >
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() =>
                              eliminarPrenda(prenda.codigoIndumentaria, prenda.idPresentacion)
                            }
                            title="Quitar prenda"
                          >
                            ×
                          </button>

                          <div className="prenda-header">
                            <div className="prenda-title-section">
                              <h4 className="prenda-name">{prenda.nombre}</h4>
                              <div className="prenda-code">
                                {prenda.codigoIndumentaria}
                              </div>
                            </div>
                          </div>

                          <div className="prenda-details">
                            <div className="prenda-detail">
                              <strong>Color:</strong> {prenda.color}
                            </div>
                            <div className="prenda-detail">
                              <strong>Talle:</strong> {prenda.talle}
                            </div>
                            <div className="prenda-detail">
                              <strong>Tela:</strong> {prenda.nombreTela}
                            </div>
                            <div
                              className="prenda-detail"
                              style={{
                                backgroundColor: "#e8f4f8",
                                padding: "8px",
                                borderRadius: "6px",
                                marginTop: "8px",
                              }}
                            >
                              <strong>📦 Presentación:</strong>{" "}
                              {prenda.nombrePresentacion || "Unidad"}
                              <div
                                style={{
                                  fontSize: "0.9em",
                                  marginTop: "4px",
                                  color: "#0066cc",
                                }}
                              >
                                {prenda.cantidadPresentaciones || prenda.cantidad}{" "}
                                {prenda.nombrePresentacion || "Unidad"}(s) ×{" "}
                                {prenda.unidadesTotales! /
                                  (prenda.cantidadPresentaciones || prenda.cantidad)}{" "}
                                unidades = {prenda.unidadesTotales || prenda.cantidad} unidades
                                totales
                              </div>
                            </div>
                          </div>

                          <div className="prenda-quantity">
                            <span className="quantity-label">
                              {prenda.nombrePresentacion &&
                              prenda.nombrePresentacion !== "Unidad"
                                ? `Cantidad (${prenda.nombrePresentacion}s):`
                                : "Cantidad:"}
                            </span>
                            <div className="quantity-value">
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => {
                                  setPrendasSeleccionadas((prev) =>
                                    prev.map((p) => {
                                      if (
                                        p.codigoIndumentaria ===
                                          prenda.codigoIndumentaria &&
                                        (p.idPresentacion || 1) ===
                                          (prenda.idPresentacion || 1)
                                      ) {
                                        const nuevaCantidad =
                                          p.cantidadPresentaciones! > 1
                                            ? p.cantidadPresentaciones! - 1
                                            : 1;
                                        const unidadesPorPres =
                                          p.unidadesTotales! /
                                          p.cantidadPresentaciones!;
                                        return {
                                          ...p,
                                          cantidadPresentaciones: nuevaCantidad,
                                          unidadesTotales:
                                            nuevaCantidad * unidadesPorPres,
                                          cantidad:
                                            nuevaCantidad * unidadesPorPres,
                                        };
                                      }
                                      return p;
                                    })
                                  );
                                }}
                                disabled={
                                  (prenda.cantidadPresentaciones || 1) <= 1
                                }
                              >
                                −
                              </button>
                              <span style={{ margin: "0 8px" }}>
                                {prenda.cantidadPresentaciones ||
                                  prenda.cantidad}
                              </span>
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => {
                                  // Buscar el stock máximo
                                  const prendaCat = indumentaria.find(
                                    (i) =>
                                      i.codigoIndumentaria ===
                                      prenda.codigoIndumentaria
                                  );
                                  
                                  // Ajustar stock en modo edición sumando unidades del pedido original
                                  const unidadesOriginales = obtenerUnidadesOriginalesPedido(
                                    prenda.codigoIndumentaria
                                  );
                                  const maxStock = prendaCat
                                    ? prendaCat.cantidadIndumentaria + unidadesOriginales
                                    : 1;

                                  // Calcular unidades ya agregadas en OTRAS presentaciones
                                  const unidadesOtrasPresentaciones =
                                    prendasSeleccionadas
                                      .filter(
                                        (p) =>
                                          p.codigoIndumentaria ===
                                            prenda.codigoIndumentaria &&
                                          (p.idPresentacion || 1) !==
                                            (prenda.idPresentacion || 1)
                                      )
                                      .reduce(
                                        (total, p) =>
                                          total +
                                          (p.unidadesTotales || p.cantidad),
                                        0
                                      );

                                  setPrendasSeleccionadas((prev) =>
                                    prev.map((p) => {
                                      if (
                                        p.codigoIndumentaria ===
                                          prenda.codigoIndumentaria &&
                                        (p.idPresentacion || 1) ===
                                          (prenda.idPresentacion || 1)
                                      ) {
                                        const unidadesPorPres =
                                          p.unidadesTotales! /
                                          p.cantidadPresentaciones!;
                                        const nuevaCantidad =
                                          p.cantidadPresentaciones! + 1;
                                        const nuevasUnidadesTotales =
                                          nuevaCantidad * unidadesPorPres;

                                        // Validar stock total considerando otras presentaciones
                                        const totalConOtrasPresentaciones =
                                          nuevasUnidadesTotales +
                                          unidadesOtrasPresentaciones;

                                        if (
                                          totalConOtrasPresentaciones > maxStock
                                        ) {
                                          const disponible =
                                            maxStock - unidadesOtrasPresentaciones;
                                          const maxPresentaciones = Math.floor(
                                            disponible / unidadesPorPres
                                          );
                                          setAlertMsg(
                                            `Stock insuficiente. Ya tienes ${unidadesOtrasPresentaciones} unidades en otras presentaciones. ` +
                                              `Máximo ${maxPresentaciones} ${p.nombrePresentacion}(s) adicionales (${disponible} unidades disponibles).`
                                          );
                                          setShowAlert(true);
                                          return p;
                                        }

                                        return {
                                          ...p,
                                          cantidadPresentaciones: nuevaCantidad,
                                          unidadesTotales:
                                            nuevasUnidadesTotales,
                                          cantidad: nuevasUnidadesTotales,
                                        };
                                      }
                                      return p;
                                    })
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <IonButton
                    className="button-secondary"
                    expand="block"
                    onClick={async () => {
                      // Recargar indumentaria antes de abrir el modal
                      await cargarIndumentaria();
                      
                      // Limpiar cantidades temporales antes de abrir el modal
                      indumentaria.forEach(
                        (prenda) => delete prenda._cantidadTemp
                      );
                      
                      // Limpiar caché de configuraciones para forzar recarga de datos actualizados
                      setConfiguracionesPorProducto(new Map());
                      setPresentacionSeleccionada(new Map());
                      setCantidadPresentaciones(new Map());
                      
                      // Pre-cargar configuraciones de presentación de TODAS las prendas
                      // Esperar a que se carguen TODAS antes de abrir el modal
                      await Promise.all(
                        indumentaria.map((prenda) => 
                          cargarConfiguracionesProducto(prenda.codigoIndumentaria)
                        )
                      );
                      
                      setShowIndumentariaModal(true);
                    }}
                  >
                    <IonIcon icon={add} slot="start" />
                    Agregar Indumentaria
                  </IonButton>
                </div>
              </div>
            </div>

            {/* Mostrar resumen de total y descuento si hay prendas */}
            {prendasSeleccionadas.length > 0 && (
              <div
                className="pedido-resumen-total"
                style={{ marginBottom: 16, marginTop: 8 }}
              >
                <div>
                  <strong>Subtotal:</strong> $
                  {totalSinDescuentos.toFixed(2)}
                </div>
                
                {/* Descuento VIP - Se muestra primero porque se aplica sobre el subtotal */}
                {esVip && (
                  <>
                    <div
                      style={{
                        color: "goldenrod",
                        fontWeight: 600,
                        textShadow:
                          "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                        marginTop: "8px",
                      }}
                    >
                      <span role="img" aria-label="vip">
                        👑
                      </span>{" "}
                      Cliente VIP : 10% de descuento aplicado
                    </div>
                    {descuento > 0 && (
                      <div>
                        <strong>Descuento VIP (10%):</strong> -${descuento.toFixed(2)}
                      </div>
                    )}
                  </>
                )}
                
                {/* Separador visual entre descuento VIP y descuentos de presentación */}
                {esVip && (descuentoPacks > 0 || descuentoCajasCerradas > 0) && (
                  <div style={{ 
                    borderTop: "1px dashed #ddd", 
                    margin: "8px 0" 
                  }}></div>
                )}
                
                {/* Descuentos por presentación */}
                {descuentoPacks > 0 && (
                  <div style={{ color: "#2196F3", fontSize: "0.95em" }}>
                    📦 Descuento por Packs (5%): -${descuentoPacks.toFixed(2)}
                  </div>
                )}
                {descuentoCajasCerradas > 0 && (
                  <div style={{ color: "#4CAF50", fontSize: "0.95em" }}>
                    📦 Descuento por Cajas Cerradas (10%): -${descuentoCajasCerradas.toFixed(2)}
                  </div>
                )}
                
                {/* Total final */}
                <div style={{ 
                  marginTop: "12px", 
                  fontSize: "1.1em",
                  paddingTop: "8px",
                  borderTop: "2px solid #fdb40b"
                }}>
                  <strong>💰 Total a pagar:</strong> $
                  {totalConDescuento.toFixed(2)}
                </div>
              </div>
            )}
            <div className="form-actions">
              <IonButton
                className="button-danger"
                fill="outline"
                expand="block"
                onClick={() => history.goBack()}
              >
                <IonIcon icon={arrowBack} slot="start" />
                Cancelar
              </IonButton>

              <IonButton
                className="button-success"
                type="submit"
                expand="block"
                disabled={!form.idCliente || prendasSeleccionadas.length === 0}
              >
                <IonIcon icon={esEdicion ? save : checkmark} slot="start" />
                {esEdicion ? "Guardar Cambios" : "Crear Pedido"}
              </IonButton>
            </div>
          </form>
        </div>

        {/* Alertas */}
        <IonAlert
          isOpen={showAlert}
          message={alertMsg}
          buttons={["Aceptar"]}
          onDidDismiss={() => setShowAlert(false)}
        />
        <IonAlert
          isOpen={showSuccess}
          message="Registro exitoso"
          buttons={[
            {
              text: "Aceptar",
              handler: () => {
                // Limpiar TODO antes de navegar
                setShowSuccess(false);
                setPrendasSeleccionadas([]);
                setForm({...estadoInicial});
                setEmpresaEnvioSeleccionada("");
                setConfiguracionesPorProducto(new Map());
                setPresentacionSeleccionada(new Map());
                setCantidadPresentaciones(new Map());
                setDatosDelPedido(null);
                setPrendasCargadasDesdeServidor(false);
                history.push("/pedidos");
              },
            },
          ]}
        />

        {/* --- Modal de selección de cliente --- */}
        <IonModal
          isOpen={showClienteModal}
          onDidDismiss={() => setShowClienteModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Cliente</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar por nombre, apellido o DNI"
                value={filtroCliente}
                onIonChange={(e) => setFiltroCliente(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonItem
              button
              onClick={() => {
                setShowClienteModal(false);
                history.push("/alta-cliente");
              }}
            >
              <IonLabel>Registrar nuevo cliente</IonLabel>
            </IonItem>
            <IonList>
              {clientesFiltrados.map((c) => (
                <IonItem
                  key={c.id}
                  button
                  onClick={() => seleccionarCliente(c)}
                  className={
                    c.estaActivo === 0 ? "cliente-inactivo" : "cliente-activo"
                  }
                >
                  <IonLabel>
                    <div className="cliente-info">
                      <div className="cliente-nombre">
                        {`${c.nombre} ${c.apellido || ""}`} ({c.numeroDocumento}
                        )
                      </div>
                      <div className="cliente-estado">
                        {c.estaActivo === 0 ? (
                          <span className="estado-chip inactivo">Inactivo</span>
                        ) : (
                          <span className="estado-chip activo">Activo</span>
                        )}
                      </div>
                    </div>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>

        {/* --- Modal de selección de indumentaria --- */}
        <IonModal
          isOpen={showIndumentariaModal}
          onDidDismiss={() => {
            setShowIndumentariaModal(false);
            setFiltroIndumentaria("");
            // Limpiar todas las cantidades temporales al cerrar el modal
            indumentaria.forEach((prenda) => delete prenda._cantidadTemp);
          }}
          className="indumentaria-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Indumentaria</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonInput
                placeholder="Buscar Indumentaria"
                value={filtroIndumentaria}
                onIonChange={(e) => setFiltroIndumentaria(e.detail.value!)}
                clearInput
              />
            </IonItem>
            <IonList class="indumentaria-list">
              {indumentaria
                .filter((i) => {
                  const filtro = (filtroIndumentaria ?? "").toLowerCase();
                  return (
                    (i.nombre ?? "").toLowerCase().includes(filtro) ||
                    (i.codigoIndumentaria &&
                      i.codigoIndumentaria.toLowerCase().includes(filtro))
                  );
                })
                .map((prenda) => {
                  const configuraciones =
                    configuracionesPorProducto.get(prenda.codigoIndumentaria) ||
                    [];
                  const presentacionActual =
                    presentacionSeleccionada.get(prenda.codigoIndumentaria) ||
                    1;
                  const cantidadPres =
                    cantidadPresentaciones.get(prenda.codigoIndumentaria) || 1;

                  // Buscar configuración seleccionada
                  const configActual = configuraciones.find(
                    (c) => c.idPresentacion === presentacionActual
                  );
                  const unidadesPorPresentacion =
                    configActual?.cantidadUnidades || 1;
                  const totalUnidades = cantidadPres * unidadesPorPresentacion;

                  // Calcular unidades ya agregadas al pedido actual
                  const unidadesYaAgregadas = prendasSeleccionadas
                    .filter(p => p.codigoIndumentaria === prenda.codigoIndumentaria)
                    .reduce((total, p) => total + (p.unidadesTotales || p.cantidad), 0);
                  
                  // Ajustar stock en modo edición sumando unidades del pedido original
                  const unidadesOriginales = obtenerUnidadesOriginalesPedido(
                    prenda.codigoIndumentaria
                  );
                  
                  // Stock disponible = (stock real + unidades originales) - unidades ya en el pedido
                  const stockDisponible = 
                    (prenda.cantidadIndumentaria + unidadesOriginales) - unidadesYaAgregadas;
                  const maxPresentaciones = Math.floor(stockDisponible / unidadesPorPresentacion);

                  return (
                    <IonItem
                      key={prenda.codigoIndumentaria}
                      className="indumentaria-item"
                    >
                      <div className="indumentaria-item-grid">
                        <div className="indumentaria-item-content">
                          {/* Información del producto */}
                          <div className="indumentaria-product-info">
                            <div className="producto-info-row producto-nombre">
                              {`${prenda.nombre} - ${prenda.color} - ${prenda.talle} - ${prenda.nombreTela}`}
                            </div>
                            <div className="producto-info-row producto-stock-total">
                              Stock total: {prenda.cantidadIndumentaria} unidades
                            </div>
                          </div>

                          {/* Controles: Presentación y Cantidad */}
                          <div className="indumentaria-controls">
                            {/* Selector de presentación */}
                            {configuraciones.length > 0 && (
                              <div className="presentacion-group">
                                <IonLabel className="presentacion-label">
                                  Presentación:
                                </IonLabel>
                                <IonSelect
                                  value={presentacionActual}
                                  onIonChange={(e) => {
                                    const newValue = Number(e.detail.value);
                                    setPresentacionSeleccionada((prev) => {
                                      const newMap = new Map(prev);
                                      newMap.set(
                                        prenda.codigoIndumentaria,
                                        newValue
                                      );
                                      return newMap;
                                    });
                                  }}
                                  interface="popover"
                                >
                                  {configuraciones.map((config) => (
                                    <IonSelectOption
                                      key={config.idPresentacion}
                                      value={config.idPresentacion}
                                    >
                                      {config.Presentacion.nombrePresentacion} (
                                      {config.cantidadUnidades} unidad
                                      {config.cantidadUnidades !== 1
                                        ? "es"
                                        : ""}
                                      )
                                    </IonSelectOption>
                                  ))}
                                </IonSelect>
                              </div>
                            )}

                            {/* Input de cantidad */}
                            <div className="cantidad-group">
                              <IonLabel className="presentacion-label">
                                Cantidad de{" "}
                                {configActual?.Presentacion
                                  .nombrePresentacion || "Unidades"}
                                :
                              </IonLabel>
                              <IonInput
                                className="cantidad-input"
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="1"
                                min={1}
                                value={cantidadPres}
                                onIonInput={(e: any) => {
                                  let valor = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  if (valor === "") valor = "1";
                                  let cantidad = Number(valor);

                                  const unidadesNecesarias =
                                    cantidad * unidadesPorPresentacion;
                                  
                                  // Validar contra stock disponible (considerando lo ya agregado al pedido)
                                  if (unidadesNecesarias > stockDisponible) {
                                    const nombrePres = configActual?.Presentacion.nombrePresentacion || "Unidad";
                                    setAlertMsg(
                                      `Stock insuficiente. Ya tienes ${unidadesYaAgregadas} unidades en el pedido. ` +
                                      `Stock disponible: ${stockDisponible} unidades. ` +
                                      `Máximo: ${maxPresentaciones} ${nombrePres}(s).`
                                    );
                                    setShowAlert(true);
                                    cantidad = maxPresentaciones > 0 ? maxPresentaciones : 1;
                                  }

                                  setCantidadPresentaciones((prev) => {
                                    const newMap = new Map(prev);
                                    newMap.set(
                                      prenda.codigoIndumentaria,
                                      cantidad
                                    );
                                    return newMap;
                                  });
                                  e.target.value = cantidad;
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                            {unidadesYaAgregadas > 0 && (
                              <div className="producto-info-row producto-stock-pedido">
                                Ya en pedido: {unidadesYaAgregadas} unidades | Disponible: {stockDisponible} unidades
                              </div>
                            )}
                          {/* Mostrar total de unidades */}
                          {unidadesPorPresentacion > 1 && (
                            <div className="unidades-info-box">
                              <span className="unidades-info-icon">📦</span>
                              <span>
                                {cantidadPres}{" "}
                                {configActual?.Presentacion.nombrePresentacion}
                                (s) × {unidadesPorPresentacion} unidades ={" "}
                                {totalUnidades} unidades totales
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Botón Agregar */}
                        <div className="indumentaria-item-actions">
                          <IonButton
                            onClick={async () => {
                              // Cargar configuraciones si no están cargadas
                              if (configuraciones.length === 0) {
                                await cargarConfiguracionesProducto(
                                  prenda.codigoIndumentaria
                                );
                              }

                              const presentacionInfo = configActual
                                ? {
                                    idPresentacion: presentacionActual,
                                    cantidadPresentaciones: cantidadPres,
                                    unidadesTotales: totalUnidades,
                                    nombrePresentacion:
                                      configActual.Presentacion
                                        .nombrePresentacion,
                                  }
                                : undefined;

                              agregarPrenda(
                                prenda,
                                cantidadPres,
                                presentacionInfo
                              );
                            }}
                            onMouseEnter={() => {
                              // Pre-cargar configuraciones al pasar el mouse
                              if (configuraciones.length === 0) {
                                cargarConfiguracionesProducto(
                                  prenda.codigoIndumentaria
                                );
                              }
                            }}
                          >
                            <IonIcon icon={add} slot="start" />
                            Agregar
                          </IonButton>
                        </div>
                      </div>
                    </IonItem>
                  );
                })}
            </IonList>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <IonButton
                color="medium"
                onClick={() => setShowIndumentariaModal(false)}
              >
                Cerrar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* --- Modal de motivo de modificación (solo en edición) --- */}
        <IonModal
          isOpen={showMotivoModal}
          onDidDismiss={() => {
            setShowMotivoModal(false);
            setMotivoSeleccionado("");
            setObservaciones("");
          }}
          className="motivo-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Motivo de Modificación</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="motivo-modal-content">
              {/* Header del modal */}
              <div className="motivo-modal-header">
                <h3 className="motivo-modal-title">Modificación de Pedido</h3>
                <p className="motivo-modal-description">
                  Para continuar con la modificación del pedido, debe
                  seleccionar el motivo que justifica este cambio. Esta
                  información quedará registrada en el historial del pedido.
                </p>
              </div>

              {/* Formulario */}
              <div className="motivo-modal-form">
                <div className="motivo-modal-form-section">
                  <div className="motivo-modal-form-label">
                    <span className="motivo-modal-form-label-text">
                      Motivo de Modificación
                    </span>
                    <span className="motivo-modal-required-badge">
                      Requerido
                    </span>
                  </div>

                  <div className="motivo-modal-radio-group">
                    {motivosModificacion.map((motivo) => (
                      <div
                        key={motivo.idMotivo}
                        className={`motivo-modal-radio-option ${
                          motivoSeleccionado === motivo.idMotivo.toString()
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setMotivoSeleccionado(motivo.idMotivo.toString())
                        }
                      >
                        <div className="motivo-modal-radio-indicator">
                          <IonIcon
                            icon={
                              motivoSeleccionado === motivo.idMotivo.toString()
                                ? radioButtonOn
                                : radioButtonOff
                            }
                            className="motivo-modal-radio-icon"
                          />
                        </div>
                        <div className="motivo-modal-radio-label">
                          {motivo.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <IonItem className="motivo-modal-form-item" lines="none">
                  <IonLabel position="floating">
                    Observaciones (opcional)
                  </IonLabel>
                  <IonTextarea
                    value={observaciones}
                    onIonChange={(e) => setObservaciones(e.detail.value!)}
                    placeholder="Agregue detalles adicionales sobre la modificación..."
                    rows={4}
                    maxlength={500}
                    className="motivo-modal-textarea"
                  />
                </IonItem>
                {observaciones && (
                  <div className="motivo-modal-char-counter">
                    {observaciones.length}/500 caracteres
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="motivo-modal-actions">
                <IonButton
                  className="motivo-modal-btn-cancel"
                  onClick={() => {
                    setShowMotivoModal(false);
                    setMotivoSeleccionado("");
                    setObservaciones("");
                    setDatosPendientesEdicion(null);
                  }}
                >
                  <IonIcon icon={close} slot="start" />
                  Cancelar
                </IonButton>
                <IonButton
                  className="motivo-modal-btn-save"
                  onClick={procesarEdicionPedido}
                  disabled={!motivoSeleccionado}
                >
                  <IonIcon icon={save} slot="start" />
                  Guardar Cambios
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AltaPedido;
