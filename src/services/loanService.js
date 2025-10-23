const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Item = require('../models/Item');
const {
  sendAprobacion,
  sendDevolucion,
  sendAplazado
} = require('./mailService');

const createLoan = async (userId, { item, aula, cantidad_prestamo }) => {
  return Loan.create({
    usuario: userId,
    item,
    aula,
    cantidad_prestamo
  });
};

const approveLoan = async (loanId, fechaEstimada) => {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const loan = await Loan.findById(loanId).session(session);
      if (!loan) throw Object.assign(new Error('Préstamo no encontrado'), { status: 404 });
      if (loan.estado !== 'Pendiente') throw Object.assign(new Error('El préstamo no está pendiente'), { status: 400 });
      if (!fechaEstimada) throw Object.assign(new Error('La fecha estimada es obligatoria'), { status: 400 });

      const item = await Item.findById(loan.item).session(session);
      if (!item) throw Object.assign(new Error('Ítem no encontrado'), { status: 404 });
      if (loan.cantidad_prestamo > item.cantidad_disponible) {
        throw Object.assign(new Error('Stock insuficiente'), { status: 400 });
      }

      loan.estado = 'Aprobado';
      loan.fecha_prestamo = new Date();
      loan.fecha_estimada = fechaEstimada;
      await loan.save({ session });

      item.cantidad_disponible -= loan.cantidad_prestamo;
      if (item.cantidad_disponible < 0) {
        throw new Error('Stock negativo');
      }
      await item.save({ session });

      result = loan;
    });
  } finally {
    session.endSession();
  }

  if (result) {
    const populated = await Loan.findById(result._id).populate(['usuario', 'item', 'aula']);
    await sendAprobacion(populated.usuario, populated, populated.item);
    return populated;
  }
};

const rejectLoan = async (loanId) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw Object.assign(new Error('Préstamo no encontrado'), { status: 404 });
  if (loan.estado !== 'Pendiente') throw Object.assign(new Error('El préstamo no está pendiente'), { status: 400 });
  loan.estado = 'Rechazado';
  await loan.save();
  return loan;
};

const returnLoan = async (loanId) => {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const loan = await Loan.findById(loanId).session(session);
      if (!loan) throw Object.assign(new Error('Préstamo no encontrado'), { status: 404 });
      if (!['Aprobado', 'Aplazado'].includes(loan.estado)) {
        throw Object.assign(new Error('El préstamo no se puede devolver'), { status: 400 });
      }

      const item = await Item.findById(loan.item).session(session);
      if (!item) throw Object.assign(new Error('Ítem no encontrado'), { status: 404 });

      loan.estado = 'Devuelto';
      loan.fecha_retorno = new Date();
      await loan.save({ session });

      item.cantidad_disponible += loan.cantidad_prestamo;
      if (item.cantidad_disponible > item.cantidad_total_stock) {
        item.cantidad_disponible = item.cantidad_total_stock;
      }
      await item.save({ session });

      result = loan;
    });
  } finally {
    session.endSession();
  }

  if (result) {
    const populated = await Loan.findById(result._id).populate(['usuario', 'item', 'aula']);
    await sendDevolucion(populated.usuario, populated, populated.item);
    return populated;
  }
};

const delayLoan = async (loanId, nuevaFecha) => {
  const loan = await Loan.findById(loanId).populate(['usuario', 'item']);
  if (!loan) throw Object.assign(new Error('Préstamo no encontrado'), { status: 404 });
  if (!['Aprobado', 'Aplazado'].includes(loan.estado)) {
    throw Object.assign(new Error('El préstamo no puede ser aplazado'), { status: 400 });
  }
  if (!nuevaFecha) throw Object.assign(new Error('La nueva fecha es obligatoria'), { status: 400 });

  loan.estado = 'Aplazado';
  loan.fecha_estimada = nuevaFecha;
  await loan.save();

  await sendAplazado(loan.usuario, loan, loan.item);
  return loan;
};

const listLoans = async ({ rol, _id }, filtros = {}) => {
  const query = {};
  if (rol !== 'Admin') {
    query.usuario = _id;
  }
  if (filtros.estado) {
    query.estado = filtros.estado;
  }
  return Loan.find(query)
    .populate('usuario item aula')
    .sort({ createdAt: -1 });
};

const getLoanById = async ({ rol, _id }, loanId) => {
  const loan = await Loan.findById(loanId).populate('usuario item aula');
  if (!loan) throw Object.assign(new Error('Préstamo no encontrado'), { status: 404 });
  if (rol !== 'Admin' && loan.usuario._id.toString() !== _id.toString()) {
    throw Object.assign(new Error('No autorizado'), { status: 403 });
  }
  return loan;
};

module.exports = {
  createLoan,
  approveLoan,
  rejectLoan,
  returnLoan,
  delayLoan,
  listLoans,
  getLoanById
};