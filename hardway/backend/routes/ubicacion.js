// routes/ubicacion.js - Rutas para manejo de ubicaciones (Domicilio, Ciudad, Barrio)
const express = require('express');
const router = express.Router();
const { Domicilio, Ciudad, Barrio } = require('../models/Ubicacion');
const { verificarAutenticacion } = require('../middleware/auth');

// Agregar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// ----- RUTAS DE CIUDADES -----

// Obtener todas las ciudades
router.get('/ciudades', async (req, res) => {
  try {
    const ciudades = await Ciudad.findAll({ order: [['nombreCiudad', 'ASC']] });
    res.json(ciudades);
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});

// Buscar o crear ciudad
router.post('/ciudades/find-or-create', async (req, res) => {
  try {
    const { nombreCiudad, codigoPostal } = req.body;
    
    if (!nombreCiudad) {
      return res.status(400).json({ error: 'El nombre de la ciudad es requerido' });
    }
    
    // Intentar encontrar la ciudad
    let ciudad = await Ciudad.findOne({ 
      where: { 
        nombreCiudad,
        ...(codigoPostal && { codigoPostal })
      } 
    });
    
    // Si no existe, crearla
    if (!ciudad) {
      ciudad = await Ciudad.create({
        nombreCiudad,
        codigoPostal: codigoPostal || ''
      });
    }
    
    res.json({ 
      idCiudad: ciudad.idCiudad,
      nombreCiudad: ciudad.nombreCiudad,
      codigoPostal: ciudad.codigoPostal
    });
  } catch (error) {
    console.error('Error al buscar o crear ciudad:', error);
    res.status(500).json({ error: 'Error al procesar la ciudad' });
  }
});

// ----- RUTAS DE BARRIOS -----

// Obtener todos los barrios
router.get('/barrios', async (req, res) => {
  try {
    const barrios = await Barrio.findAll({
      include: [{ model: Ciudad, as: 'Ciudad' }],
      order: [['nombreBarrio', 'ASC']]
    });
    res.json(barrios);
  } catch (error) {
    console.error('Error al obtener barrios:', error);
    res.status(500).json({ error: 'Error al obtener barrios' });
  }
});

// Buscar o crear barrio
router.post('/barrios/find-or-create', async (req, res) => {
  try {
    const { nombreBarrio, idCiudad } = req.body;
    
    if (!nombreBarrio || !idCiudad) {
      return res.status(400).json({ 
        error: 'El nombre del barrio y el ID de la ciudad son requeridos' 
      });
    }
    
    // Verificar que la ciudad existe
    const ciudad = await Ciudad.findByPk(idCiudad);
    if (!ciudad) {
      return res.status(404).json({ error: 'La ciudad especificada no existe' });
    }
    
    // Intentar encontrar el barrio
    let barrio = await Barrio.findOne({ 
      where: { 
        nombreBarrio,
        idCiudad
      } 
    });
    
    // Si no existe, crearlo
    if (!barrio) {
      barrio = await Barrio.create({
        nombreBarrio,
        idCiudad
      });
    }
    
    res.json({ 
      idBarrio: barrio.idBarrio,
      nombreBarrio: barrio.nombreBarrio,
      idCiudad: barrio.idCiudad
    });
  } catch (error) {
    console.error('Error al buscar o crear barrio:', error);
    res.status(500).json({ error: 'Error al procesar el barrio' });
  }
});

module.exports = router;
