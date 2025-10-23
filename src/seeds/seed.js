require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Classroom = require('../models/Classroom');
const Item = require('../models/Item');
const logger = require('../config/logger');

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Classroom.deleteMany({}),
    Item.deleteMany({})
  ]);

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('Usuario123!', 10);

  await User.create([
    { nombre: 'Administrador', email: 'admin@demo.com', passwordHash: adminPassword, rol: 'Admin' },
    { nombre: 'Usuario Demo', email: 'usuario@demo.com', passwordHash: userPassword, rol: 'Comun' }
  ]);

  const categorias = await Category.create([
    { nombre: 'Electrónica', descripcion: 'Componentes electrónicos' },
    { nombre: 'Herramientas', descripcion: 'Herramientas manuales' },
    { nombre: 'Material Educativo', descripcion: 'Materiales para clases' }
  ]);

  const aulas = await Classroom.create([
    { nombre: 'Laboratorio 101', descripcion: 'Laboratorio principal' },
    { nombre: 'Taller 202', descripcion: 'Taller de mantenimiento' }
  ]);

  const [electronica, herramientas, material] = categorias;
  const [lab, taller] = aulas;

  const itemsData = [
    { nombre: 'Multímetro', categoria: electronica._id, aula: lab._id, cantidad_total_stock: 10, cantidad_disponible: 10, tipo_categoria: 'Herramienta de equipo', estado: 'Disponible' },
    { nombre: 'Osciloscopio', categoria: electronica._id, aula: lab._id, cantidad_total_stock: 5, cantidad_disponible: 3, tipo_categoria: 'Herramienta de equipo', estado: 'Disponible' },
    { nombre: 'Resistencias 220Ω', categoria: electronica._id, aula: lab._id, cantidad_total_stock: 200, cantidad_disponible: 150, tipo_categoria: 'Consumible', estado: 'Disponible' },
    { nombre: 'Destornillador Philips', categoria: herramientas._id, aula: taller._id, cantidad_total_stock: 20, cantidad_disponible: 15, tipo_categoria: 'Herramienta de equipo', estado: 'Disponible' },
    { nombre: 'Taladro', categoria: herramientas._id, aula: taller._id, cantidad_total_stock: 4, cantidad_disponible: 1, tipo_categoria: 'Herramienta de equipo', estado: 'Disponible' },
    { nombre: 'Guantes de seguridad', categoria: herramientas._id, aula: taller._id, cantidad_total_stock: 50, cantidad_disponible: 0, tipo_categoria: 'De Uso Controlado', estado: 'Agotado' },
    { nombre: 'Arduino Uno', categoria: electronica._id, aula: lab._id, cantidad_total_stock: 25, cantidad_disponible: 20, tipo_categoria: 'Placa SENA', estado: 'Disponible' },
    { nombre: 'Cables Dupont', categoria: electronica._id, aula: lab._id, cantidad_total_stock: 100, cantidad_disponible: 40, tipo_categoria: 'Consumible', estado: 'Disponible' },
    { nombre: 'Kit de robótica', categoria: material._id, aula: lab._id, cantidad_total_stock: 8, cantidad_disponible: 5, tipo_categoria: 'Herramienta de equipo', estado: 'Disponible' },
    { nombre: 'Proyector', categoria: material._id, aula: lab._id, cantidad_total_stock: 3, cantidad_disponible: 2, tipo_categoria: 'Devolutivo', estado: 'Disponible' }
  ];

  await Item.insertMany(itemsData);

  logger.info('Seed completado');
  await mongoose.disconnect();
};

seed().catch((error) => {
  logger.error('Error en seed', error);
  mongoose.disconnect();
});