const { Pedido, Cliente, Persona, EstadoPedido, EmpresaEnvio } = require("../models");

// Handler directo para consulta-invitado
module.exports = async (req, res) => {
  console.log(">>> Handler consulta-invitado alcanzado <<<");
  console.log(`Method: ${req.method} | Headers: ${JSON.stringify(req.headers)}`);

  // Manejar preflight OPTIONS (CORS) si llega
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS preflight for consulta-invitado, returning 204');
    return res.sendStatus(204);
  }
  const { numeroPedido, dni, email } = req.body || {};
  console.log('[CONSULTA INVITADO] rawBody:', req.rawBody || '<no rawBody>');
  console.log(`[CONSULTA INVITADO] Pedido: ${numeroPedido}, DNI: ${dni}, Email: ${email}, IP: ${req.ip}`);
  if (!numeroPedido || (!dni && !email)) {
    return res.status(400).json({ error: "Debe enviar numeroPedido y DNI o email" });
  }
  try {
    const pedido = await Pedido.findOne({
      where: { numeroPedido },
      include: [
        {
          model: Cliente,
          include: [{ model: Persona }],
        },
        { model: EstadoPedido },
        { model: EmpresaEnvio },
      ],
    });
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const persona = pedido.Cliente?.Persona;
    const dniValido = dni && persona && String(persona.dni) === String(dni);
    // El email puede estar en Cliente.email o (rara vez) en Persona.email; comprobar ambos
    const clienteEmail = pedido.Cliente && pedido.Cliente.email ? String(pedido.Cliente.email).toLowerCase() : null;
    const personaEmail = persona && persona.email ? String(persona.email).toLowerCase() : null;
    const emailValido = email && ((clienteEmail && clienteEmail === String(email).toLowerCase()) || (personaEmail && personaEmail === String(email).toLowerCase()));
    if (!dniValido && !emailValido) {
      return res.status(403).json({ error: "Datos de validación incorrectos" });
    }
    // Construir nombre legible del cliente (si existe)
    const clienteNombre = persona
      ? [persona.nombre, persona.apellido].filter(Boolean).join(' ')
      : (pedido.Cliente?.razonSocial || pedido.Cliente?.nombre || null);

    const resumen = {
      numeroPedido: pedido.numeroPedido,
      estado: pedido.EstadoPedido?.tipoEstado,
      fechaPedido: pedido.fechaPedido,
      empresaEnvio: pedido.EmpresaEnvio?.nombre,
      codigoSeguimiento: pedido.codigoSeguimiento,
      clienteNombre: clienteNombre,
      persona: persona ? { nombre: persona.nombre || null, apellido: persona.apellido || null, dni: persona.dni || null, email: persona.email || null } : null,
    };

    console.log('[CONSULTA INVITADO] resumen:', resumen);
    return res.json(resumen);
  } catch (error) {
    console.error("Error consulta invitado:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
