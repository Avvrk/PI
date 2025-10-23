const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign({
    sub: user._id,
    rol: user.rol
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email ya registrado' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email, passwordHash });
    const token = signToken(user);
    res.status(201).json({
      token,
      nombre: user.nombre,
      rol: user.rol
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = signToken(user);
    res.json({
      token,
      nombre: user.nombre,
      rol: user.rol
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  const { passwordHash, ...data } = req.user;
  res.json(data);
};

module.exports = {
  register,
  login,
  me
};