import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonProgressBar, useIonViewWillEnter } from "@ionic/react";
import { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./Chatbot.css";
import { estadosPedido, estadoIdToIndex, findIndexByLabelOrKey, normalize, isCancelledById } from "../utils/estados";
import getTrackingUrl from "../utils/tracking";

const ChatbotPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage className="chatbot-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>Volver</IonButton>
          </IonButtons>
          <IonTitle> Asistente de Pedidos Hardway 🤖 </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="chatbot-content" fullscreen>
        <div className="chatbot-wrapper">
          <div className="chatbot-container">
            <GuestQueryForm />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatbotPage;

const GuestQueryForm: React.FC = () => {
  const [step, setStep] = useState<'intro'|'askPedido'|'askValidate'|'confirm'|'loading'|'result'>('intro');
  const [messages, setMessages] = useState<Array<{ from: 'bot'|'user', text: string }>>([
    { from: 'bot', text: 'Hola! Soy el asistente de pedidos. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  

  const pushBot = (text: string) => setMessages(m => [...m, { from: 'bot', text }]);
  const pushUser = (text: string) => setMessages(m => [...m, { from: 'user', text }]);

  const chatRef = useRef<HTMLDivElement | null>(null);

  // Scroll automático al recibir mensajes o resultados
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, result]);

  // Limpiar estado cada vez que se entra a la vista del chatbot
  useIonViewWillEnter(() => {
    setMessages([{ from: 'bot', text: 'Hola! Soy el asistente de pedidos. ¿En qué puedo ayudarte hoy?' }]);
    setInputValue('');
    setNumeroPedido('');
    setDni('');
    setEmail('');
    setLoading(false);
    setErrorMsg(null);
    setResult(null);
    setStep('intro');
  });

  const obtenerPasoDesdeEstado = (estado: string | undefined) => {
    if (!estado) return 0;
    const e = String(estado).toLowerCase();
    // Detectar pedidos cancelados
    if (e.includes('cancel') || e.includes('anulado') || e.includes('cancelado')) return -1;
    if (e.includes('curso') || e.includes('creado')) return 0;
    if (e.includes('pago') && !e.includes('abon')) return 1;
    if (e.includes('abon') || e.includes('abonado')) return 2;
    if (e.includes('despach') || e.includes('en camino') || e.includes('enviado')) return 3;
    if (e.includes('final') || e.includes('entregado')) return 4;
    return 0;
  };

  const trackingLink = result ? getTrackingUrl(result.empresaEnvio) : null;
  const trackingCode = result ? (result.codigoSeguimiento || result.numeroSeguimiento || null) : null;

  const ProgressBar: React.FC<{ respuesta?: any }> = ({ respuesta }) => {
    // Determine index from respuesta: prefer numeric idEstado
    const getIndex = (resp: any): number | null => {
      if (!resp) return null;
      if (typeof resp.idEstado === 'number') {
        // check cancel
        if (isCancelledById(resp.idEstado)) return -1;
        return estadoIdToIndex(resp.idEstado);
      }
      if (resp.estado) {
        const idx = findIndexByLabelOrKey(resp.estado);
        if (idx != null) return idx;
        // detect cancel text
        const s = normalize(resp.estado);
        if (s.includes('cancel')) return -1;
      }
      return null;
    };

    const pasoIdx = getIndex(respuesta);

    // If cancelled
    if (pasoIdx === -1) {
      return (
        <div className="chatbot-progress">
          <div className="progreso-cancelado">
            <div className="estado-cancelado">
              <div className="circulo-cancelado">✖</div>
              <div className="info-estado-cancelado">
                <div className="nombre-estado-cancelado">Pedido cancelado</div>
                <div className="descripcion-estado-cancelado">El pedido fue cancelado</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If unknown mapping -> indeterminate
    if (pasoIdx === null) {
      return (
        <div className="chatbot-progress">
          <IonProgressBar type="indeterminate"></IonProgressBar>
          <div style={{ marginTop: 8, textAlign: 'center' }} className="chatbot-muted">Estado no disponible — mostrando actividad</div>
        </div>
      );
    }

    const pasos = estadosPedido;
    const totalSteps = pasos.length - 1;
    const value = totalSteps > 0 ? Math.max(0, Math.min(1, pasoIdx / totalSteps)) : 0;
    const buffer = Math.min(1, value + 0.12);

    return (
      <div className="chatbot-progress">
        <IonProgressBar value={value} buffer={buffer} color={"light"}></IonProgressBar>
        <div className="chatbot-progress-line" />
        <div className="chatbot-steps">
          {pasos.map((p, i) => {
            const Icon = p.Icon;
            // Color mapping similar to DetallePedido
            const getColorForKey = (k: string | undefined) => {
              const key = (k || '').toString().toLowerCase();
              switch (key) {
                case 'creado': // En Curso
                  return '#497ef1';
                case 'pago': // Pendiente de Pago
                  return '#eaa40c';
                case 'abonado': // Abonado
                  return '#16a34a';
                case 'enviado': // Despachado
                  return '#38bdf8';
                case 'entregado': // Finalizado
                  return '#7c3aed';
                case 'cancelado':
                case 'cancel':
                  return '#dc2626';
                default:
                  return '#9ca3af';
              }
            };

            const color = getColorForKey(p.key);
            const isActive = i <= pasoIdx;
            const isCurrent = i === pasoIdx;
            const circleStyle: React.CSSProperties = {
              background: isActive ? color : '#e5e7eb',
              color: isActive ? '#fff' : '#374151',
              boxShadow: isCurrent ? `0 4px 12px ${isActive ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)'}` : undefined,
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            };

            const labelStyle: React.CSSProperties = {
              color: isActive ? color : '#6b7280',
              fontWeight: isCurrent ? 700 : 600,
            };

            return (
              <div key={p.key} className={`chatbot-step ${isActive ? 'active' : ''}`}>
                <div className={`chatbot-step-circle circulo-estado ${isActive ? 'activo' : ''} ${isCurrent ? 'actual' : ''}`} style={circleStyle}>
                  <div className="icono-estado"><Icon size={22} /></div>
                </div>
                <div className="nombre-estado" style={labelStyle}>{p.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helpers de formato (similar a DetallePedido)
  const mostrar = (valor: any) => {
    if (valor === null || valor === undefined || valor === "") return '-';
    return valor;
  };

  const mostrarPrecio = (valor: any) => {
    if (valor === null || valor === undefined || isNaN(Number(valor))) return '-';
    return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const formatDate = (valor: any) => {
    if (!valor) return '-';
    try { return new Date(valor).toLocaleString('es-AR'); } catch (e) { return String(valor); }
  };

  // Mapea estado/resultado a color de badge (misma paleta que DetallePedido)
  const getBadgeColor = (res: any) => {
    if (!res) return '#9ca3af';
    // Preferir idEstado numérico si existe
    if (typeof res.idEstado === 'number') {
      if (isCancelledById(res.idEstado)) return '#dc2626';
      const idx = estadoIdToIndex(res.idEstado);
      // mapear index a colores similares a los keys
      switch (idx) {
        case 0: return '#497ef1'; // En Curso
        case 1: return '#eaa40c'; // Pendiente de Pago
        case 2: return '#16a34a'; // Abonado
        case 3: return '#38bdf8'; // Despachado
        case 4: return '#7c3aed'; // Finalizado
        default: return '#9ca3af';
      }
    }
    // Sino, usar la etiqueta de texto
    const s = String(res.estado || '').toLowerCase();
    if (s.includes('cancel')) return '#dc2626';
    if (s.includes('pago') && !s.includes('abon')) return '#eaa40c';
    if (s.includes('abon')) return '#16a34a';
    if (s.includes('despach') || s.includes('en camino') || s.includes('enviado')) return '#38bdf8';
    if (s.includes('final') || s.includes('entregado')) return '#7c3aed';
    if (s.includes('curso') || s.includes('creado')) return '#497ef1';
    return '#9ca3af';
  };

  // Normaliza entradas cortas de número de pedido a formato `PED-YYYYMMDD-<n>`.
  // Acepta: "2025102914", "2025-10-29-14", o ya formato "PED-...".
  // Requiere al menos 9 dígitos (8 para fecha YYYYMMDD + 1 dígito sufijo).
  const formatNumeroPedido = (raw: string): string | null => {
    if (!raw) return null;
    const s = String(raw).trim();
    // Si ya llega en formato PED-..., lo aceptamos tal cual
    if (/^PED-/i.test(s)) return s;

    // Extraer solo dígitos
    const digits = s.replace(/\D/g, '');
    if (digits.length < 10) return null;

    const datePart = digits.slice(0, 8); // YYYYMMDD
    const suffix = digits.slice(8);

    // Validación básica de fecha
    const y = Number(datePart.slice(0, 4));
    const m = Number(datePart.slice(4, 6));
    const d = Number(datePart.slice(6, 8));
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    return `PED-${datePart}-${suffix}`;
  };

  const startConsulta = () => {
    pushUser('Quiero consultar un pedido');
    pushBot('Perfecto. Por favor, indique el número de pedido (ej: 2025102914)');
    setStep('askPedido');
  };

  const handleSend = async () => {
    setErrorMsg(null);
    const text = inputValue.trim();
    if (!text) return;
    pushUser(text);
    setInputValue('');

    if (step === 'intro') {
      const formatted = formatNumeroPedido(text);
      if (!formatted) {
        pushBot('El número de pedido no es válido. Por favor ingrese el número completo (ej: 2025102914)');
        setStep('askPedido');
        return;
      }
      setNumeroPedido(formatted);
      pushBot('Gracias. Ahora ingrese DNI o email usado en el pedido para validar.');
      setStep('askValidate');
      return;
    }

    if (step === 'askPedido') {
      const formatted = formatNumeroPedido(text);
      if (!formatted) {
        pushBot('El número de pedido no es válido. Por favor ingrese el número completo (ej: 2025102914)');
        setStep('askPedido');
        return;
      }
      setNumeroPedido(formatted);
      // Si ya tenemos DNI o email guardado (cliente reutiliza la validación), no pedir nuevamente
      if (dni || email) {
        pushBot('Recibido. Usando los datos de validación previos — consultando el pedido, espere por favor...');
        setStep('loading');
        const sendDni = dni || '';
        const sendEmail = !dni && email ? email : '';
        await performConsulta(formatted, sendDni, sendEmail);
      } else {
        pushBot('Recibido. Ahora por favor ingrese DNI/CUIL/CUIT o email para validar la consulta.');
        setStep('askValidate');
      }
      return;
    }

    if (step === 'askValidate') {
      // Guardar el valor ingresado y usarlo directamente al enviar la consulta.
      if (text.includes('@')) {
        const emailVal = text.trim().toLowerCase();
        setEmail(emailVal);
        pushBot('Perfecto — consultando el pedido, espere por favor...');
        setStep('loading');
        await performConsulta(numeroPedido || inputValue, '', emailVal);
      } else {
        // Validar que el dni tenga 8 o 11 dígitos
        const digits = text.replace(/\D/g, '');
        if (!(digits.length === 8 || digits.length === 11)) {
          pushBot('El Número de Documento debe tener 8 o 11 dígitos. Por favor ingrese nuevamente.');
          setStep('askValidate');
          return;
        }
        setDni(digits);
        pushBot('Perfecto — consultando el pedido, espere por favor...');
        setStep('loading');
        await performConsulta(numeroPedido || inputValue, digits, '');
      }
      return;
    }
  };

  const performConsulta = async (pedidoNum: string, dniVal?: string, emailVal?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    try {
      const resp = await fetch('http://localhost:5678/webhook/consulta-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroPedido: pedidoNum, dni: dniVal || undefined, email: emailVal || undefined }),
      });

      // Manejar códigos HTTP primero (403 = validación falló, 404 = no encontrado)
      if (resp.status === 403) {
        // Si ya tenemos validación previa (dni o email), pedir solo número de pedido nuevamente
        if (dni || email) {
          pushBot('No se encontró un pedido con ese número para el cliente. Por favor ingrese otro número de pedido.');
          setStep('askPedido');
          setLoading(false);
          return;
        }
        if (emailVal) {
          pushBot('No se encontró ningún pedido asociado a ese email. Por favor verifique y vuelva a intentarlo.');
        } else {
          pushBot('No se encontró ningún pedido asociado a ese Número de Documento. Por favor verifique y vuelva a intentarlo.');
        }
        setStep('askValidate');
        setLoading(false);
        return;
      }
      if (resp.status === 404) {
        pushBot('No se encontró información para ese pedido. Por favor verifique el número y vuelva a intentarlo.');
        setStep('intro');
        setLoading(false);
        return;
      }

      // Leer el cuerpo como texto y manejar respuestas vacías o no-JSON sin romper la UI
      const rawText = await resp.text();
      if (!rawText || !rawText.trim()) {
        // Si ya tenemos validación previa (dni o email), pedir solo número de pedido nuevamente
        if (dni || email) {
          pushBot('No se encontró un pedido con ese número para el cliente. Por favor ingrese otro número de pedido.');
          setStep('askPedido');
          setLoading(false);
          return;
        }
        // Si no hay validación previa, diferenciar por lo enviado
        if (dniVal || emailVal) {
          pushBot(emailVal ? 'No se encontró ningún pedido asociado a ese email. Por favor verifique y vuelva a intentarlo.' : 'No se encontró ningún pedido asociado a ese Número de Documento. Por favor verifique y vuelva a intentarlo.');
          setStep('askValidate');
          setLoading(false);
          return;
        }
        pushBot('No se encontró información para ese pedido. Por favor verifique el número y vuelva a intentarlo.');
        setStep('intro');
        setLoading(false);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        // Respuesta no es JSON -- informar al usuario de forma amigable
        pushBot('La respuesta del servidor tenía un formato inesperado. Intente nuevamente más tarde.');
        setStep('intro');
        setLoading(false);
        return;
      }

      // Si el backend devolviera un objeto de error con status 200, manejarlo también
      if (data && typeof data === 'object' && data.error) {
        const msgLower = String(data.error).toLowerCase();
        if (emailVal && msgLower.includes('email')) {
          if (dni || email) {
            pushBot('No se encontró un pedido con ese número para el cliente. Por favor ingrese otro número de pedido.');
            setStep('askPedido');
            setLoading(false);
            return;
          }
          pushBot('No se encontró ningún pedido asociado a ese email. Por favor verifique y vuelva a intentarlo.');
          setStep('askValidate');
          setLoading(false);
          return;
        }
        if (dniVal && msgLower.includes('dni')) {
          if (dni || email) {
            pushBot('No se encontró un pedido con ese número para el cliente. Por favor ingrese otro número de pedido.');
            setStep('askPedido');
            setLoading(false);
            return;
          }
          pushBot('No se encontró ningún pedido asociado a ese Número de Documento. Por favor verifique y vuelva a intentarlo.');
          setStep('askValidate');
          setLoading(false);
          return;
        }
        // genérico
        pushBot(String(data.error));
        setStep('intro');
        setLoading(false);
        return;
      }

      const normalized = Array.isArray(data) ? data[0] : data;
      // Si se proporcionó DNI, verificar que coincida con el cliente retornado
      const extractDniFromResult = (obj: any): string | null => {
        if (!obj) return null;
        const candidates: Array<any> = [];
        if (obj.persona && typeof obj.persona === 'object') {
          candidates.push(obj.persona.dni, obj.persona.documento, obj.persona.numeroDocumento, obj.persona.documentoNumero);
        }
        if (obj.cliente && typeof obj.cliente === 'object') {
          candidates.push(obj.cliente.dni, obj.cliente.documento, obj.cliente.numeroDocumento, obj.cliente.documentoNumero);
        }
        candidates.push(obj.dniCliente, obj.numeroDocumentoCliente, obj.documento, obj.dni, obj.numeroDocumento);
        for (const c of candidates) {
          if (!c && c !== 0) continue;
          const s = String(c).replace(/\D/g, '').trim();
          if (s) return s;
        }
        return null;
      };

      const providedDniDigits = dniVal ? String(dniVal).replace(/\D/g, '') : '';
      const foundDni = extractDniFromResult(normalized);
      if (providedDniDigits && foundDni && providedDniDigits !== foundDni) {
        if (dni || email) {
          pushBot('No se encontró un pedido con ese número para el cliente. Por favor ingrese otro número de pedido.');
          setStep('askPedido');
          setLoading(false);
          return;
        }
        pushBot('No se encontró ningún pedido asociado a ese Número de Documento. Por favor verifique y vuelva a intentarlo.');
        setStep('askValidate');
        setLoading(false);
        return;
      }

      setResult(normalized);
      const extractClientName = (obj: any): string | null => {
        if (!obj) return null;
        // common direct fields
        if (typeof obj.cliente === 'string' && obj.cliente.trim()) return obj.cliente.trim();
        if (obj.nombreCompleto || obj.nombre_completo || obj.fullName) return (obj.nombreCompleto || obj.nombre_completo || obj.fullName).trim();
        if (obj.nombreCliente || obj.clienteNombre) return (obj.nombreCliente || obj.clienteNombre).trim();

        // nested cliente object
        const parts: string[] = [];
        if (obj.cliente && typeof obj.cliente === 'object') {
          if (obj.cliente.nombre) parts.push(String(obj.cliente.nombre));
          if (obj.cliente.apellido) parts.push(String(obj.cliente.apellido));
          if (obj.cliente.razonSocial) return String(obj.cliente.razonSocial).trim();
          if (obj.cliente.denominacion) return String(obj.cliente.denominacion).trim();
        }

        // persona object
        if (obj.persona && typeof obj.persona === 'object') {
          if (obj.persona.nombre) parts.push(String(obj.persona.nombre));
          if (obj.persona.apellido) parts.push(String(obj.persona.apellido));
        }

        // top-level nombre/apellido
        if (obj.nombre) parts.unshift(String(obj.nombre));
        if (obj.apellido) parts.push(String(obj.apellido));

        const joined = parts.map(p => p && p.trim()).filter(Boolean).join(' ');
        if (joined) return joined;

        // other common containers
        if (obj.datosCliente && typeof obj.datosCliente === 'object') {
          const dn = (obj.datosCliente.nombre || obj.datosCliente.nombreCompleto || obj.datosCliente.razonSocial);
          if (dn) return String(dn).trim();
        }

        return null;
      };

      const clientName = extractClientName(normalized);
      if (clientName) {
        pushBot(`Un gusto ${clientName}. Aquí está la información encontrada:`);
      } else {
        pushBot('Aquí está la información encontrada:');
      }
      setStep('result');
    } catch (err: any) {
      setErrorMsg(err?.message || String(err));
      pushBot('Lo siento, ocurrió un error al consultar. Intente nuevamente más tarde.');
      setStep('intro');
    } finally {
      setLoading(false);
    }
  };

  // Mantener DNI/email y permitir consultar otro pedido sin pedir re-validación
  const handleConsultarOtro = () => {
    setResult(null);
    setNumeroPedido('');
    setInputValue('');
    pushBot('Perfecto. Por favor indique el número del próximo pedido (ej: 2025102914)');
    setStep('askPedido');
  };

  // Cerrar chat y limpiar estado
  const handleCerrarChat = () => {
    setMessages([{ from: 'bot', text: 'Hola! Soy el asistente de pedidos. ¿En qué puedo ayudarte hoy?' }]);
    setInputValue('');
    setNumeroPedido('');
    setDni('');
    setEmail('');
    setResult(null);
    setErrorMsg(null);
    setStep('intro');
  };

  

  return (
    <div>
      <div className="chat-window" ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chatbot-message-row ${m.from === 'bot' ? 'bot' : 'user'}`}>
            {m.from === 'bot' && <div className="chatbot-avatar bot">🤖</div>}
            <div className={m.from === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}>
              {m.text}
            </div>
            {m.from === 'user' && <div className="chatbot-avatar user">U</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {step === 'intro' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="chatbot-primary-button" onClick={startConsulta}>Consultar pedido</button>
            {/*<button type="button" className="chatbot-secondary-button" onClick={() => { pushUser('Otra consulta'); pushBot('Actualmente solo puedo ayudar con consultas de pedido.'); }}>Otra</button>*/}
          </div>
        )}

        {step !== 'intro' && (
          <>
            <div className="chatbot-chat-input-row">
              <div className="chatbot-input-field">
                <input
                  className="chatbot-input-field-element"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                  placeholder={step === 'askPedido' ? 'Número de pedido' : step === 'askValidate' ? 'DNI o email' : 'Escribe aquí...'}
                />
              </div>
              <button className="chatbot-send-button" onClick={handleSend} disabled={loading} aria-label="Enviar">{loading ? '...' : '➤'}</button>
            </div>

            {result && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="chatbot-primary-button" onClick={handleConsultarOtro}>Consultar otro pedido</button>
                <button className="chatbot-secondary-button" onClick={handleCerrarChat}>Cerrar chat</button>
              </div>
            )}
          </>
        )}

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {result && (
          <>
            <ProgressBar respuesta={result} />
            <div className="chatbot-chat-result chatbot-fade-in">
              <div className="chatbot-result-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="chatbot-result-icon">📦</div>
                  <div>
                    <h4 style={{ margin: 0 }}>Resultado</h4>
                 </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(() => {
                    const badgeColor = getBadgeColor(result);
                    const textColor = '#ffffff';
                    return (
                      <div className="chatbot-status-badge" style={{ backgroundColor: badgeColor, color: textColor }}>
                        {mostrar(result.estado)}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="chatbot-result-grid">
                <div className="chatbot-result-row"><div className="chatbot-label">Número</div><div className="chatbot-value">{mostrar(result.numeroPedido)}</div></div>
                <div className="chatbot-result-row"><div className="chatbot-label">Fecha del pedido</div><div className="chatbot-value">{formatDate(result.fechaPedido)}</div></div>
                <div className="chatbot-result-row"><div className="chatbot-label">Empresa de envío</div><div className="chatbot-value">{mostrar(result.empresaEnvio)}</div></div>
                {trackingCode ? (
                  <div className="chatbot-result-row chatbot-tracking-row">
                    <div className="chatbot-label">Código de seguimiento</div>
                    <div className="chatbot-value">{mostrar(trackingCode)}</div>
                    <button className="chatbot-copy-button" onClick={async () => { try { await navigator.clipboard.writeText(String(trackingCode || '')); pushBot('Código de seguimiento copiado al portapapeles.'); } catch { pushBot('No se pudo copiar el código.'); } }}>Copiar</button>
                  </div>
                ) : (
                  <div className="chatbot-result-row chatbot-tracking-row">
                    <div className="chatbot-label">Código de seguimiento</div>
                    <div className="chatbot-value">Codigo de seguimiento aun no asignado</div>
                  </div>
                )}
                {trackingLink && trackingCode && (
                  <div className="chatbot-tracking-links" style={{ marginTop: 10 }}>
                    <div className="chatbot-label" style={{ width: 'auto', minWidth: 0 }}>Seguir envío en</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a className="chatbot-track-link" href={trackingLink.url} target="_blank" rel="noopener noreferrer">{trackingLink.label}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* detalle eliminado: ya no se muestra información extendida */}
            </div>
          </>
        )}
        
      </div>
    </div>
  );
};
