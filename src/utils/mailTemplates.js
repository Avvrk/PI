const formatDate = (date) => new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(date);

const aprobacionTemplate = ({ nombreUsuario, itemNombre, fechaEstimada, cantidad }) => ({
  subject: 'Préstamo aprobado',
  text: `Hola ${nombreUsuario}, tu préstamo del ítem "${itemNombre}" por ${cantidad} unidad(es) fue aprobado. Debes devolverlo antes del ${formatDate(fechaEstimada)}.`
});

const devolucionTemplate = ({ nombreUsuario, itemNombre, cantidad }) => ({
  subject: 'Préstamo devuelto',
  text: `Hola ${nombreUsuario}, registramos la devolución del ítem "${itemNombre}" (${cantidad}). ¡Gracias!`
});

const recordatorioTemplate = ({ nombreUsuario, itemNombre, fechaEstimada }) => ({
  subject: 'Recordatorio de devolución',
  text: `Hola ${nombreUsuario}, recuerda devolver el ítem "${itemNombre}" antes del ${formatDate(fechaEstimada)}.`
});

const aplazadoTemplate = ({ nombreUsuario, itemNombre, nuevaFecha }) => ({
  subject: 'Fecha de préstamo aplazada',
  text: `Hola ${nombreUsuario}, la fecha estimada de devolución del ítem "${itemNombre}" fue actualizada al ${formatDate(nuevaFecha)}.`
});

module.exports = {
  aprobacionTemplate,
  devolucionTemplate,
  recordatorioTemplate,
  aplazadoTemplate
};