const { Pedido, DetallePedido, Cliente, Persona, EstadoPedido, EmpresaEnvio } = require("../models");

// Endpoint público para obtener resumen de detalle de pedido
module.exports = async (req, res) => {
  console.log('>>> Handler detalle-pedido-publico alcanzado <<<');
  console.log(`Method: ${req.method} | Headers: ${JSON.stringify(req.headers)}`);

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  const { numeroPedido, dni, email } = req.body || {};
  console.log('[DETALLE PUBLICO] rawBody:', req.rawBody || '<no rawBody>');
  console.log(`[DETALLE PUBLICO] Pedido: ${numeroPedido}, DNI: ${dni}, Email: ${email}, IP: ${req.ip}`);

  if (!numeroPedido || (!dni && !email)) {
    return res.status(400).json({ error: 'Debe enviar numeroPedido y DNI o email' });
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
        {
          model: DetallePedido,
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const persona = pedido.Cliente?.Persona;
    const dniValido = dni && persona && String(persona.dni) === String(dni);
    const emailValido = email && persona && String(persona.email).toLowerCase() === String(email).toLowerCase();

    if (!dniValido && !emailValido) {
      return res.status(403).json({ error: 'Datos de validación incorrectos' });
    }

    // Construir resumen de items
    const items = (pedido.DetallePedidos || pedido.DetallePedido || []).map((d) => ({
      codigoIndumentaria: d.codigoIndumentaria || d.codigo_indumentaria || null,
      cantidad: d.cantidad || 0,
      idPresentacion: d.idPresentacion || d.id_presentacion || null,
      unidadesTotales: d.unidadesTotales || d.unidades_totales || null,
    }));

    // Construir nombre legible del cliente (si existe)
    const clienteNombre = persona
      ? [persona.nombre, persona.apellido].filter(Boolean).join(' ')
      : (pedido.Cliente?.razonSocial || pedido.Cliente?.nombre || null);

    const resumen = {
      numeroPedido: pedido.numeroPedido,
      estado: pedido.EstadoPedido?.tipoEstado || pedido.tipoEstado || null,
      fechaPedido: pedido.fechaPedido,
      empresaEnvio: pedido.EmpresaEnvio?.nombre || null,
      codigoSeguimiento: pedido.codigoSeguimiento || pedido.numeroSeguimiento || null,
      clienteNombre: clienteNombre,
      // incluir algunos datos de persona mínimos para validación/UX si están disponibles
      persona: persona ? { nombre: persona.nombre || null, apellido: persona.apellido || null, dni: persona.dni || null, email: persona.email || null } : null,
      items,
      totalItems: items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0),
    };

    console.log('[DETALLE PUBLICO] resumen:', resumen);
    return res.json(resumen);
  } catch (error) {
    console.error('Error detalle-pedido-publico:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
