const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const {
  aprobacionTemplate,
  devolucionTemplate,
  recordatorioTemplate,
  aplazadoTemplate
} = require('../utils/mailTemplates');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST) {
      throw new Error('SMTP_HOST no está configurado');
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text
  };

  try {
    const tx = await getTransporter().sendMail(mailOptions);
    logger.info('Correo enviado', { messageId: tx.messageId, to });
  } catch (error) {
    logger.error('Error enviando correo', error);
  }
};

const sendAprobacion = (user, loan, item) => {
  const template = aprobacionTemplate({
    nombreUsuario: user.nombre,
    itemNombre: item.nombre,
    fechaEstimada: loan.fecha_estimada,
    cantidad: loan.cantidad_prestamo
  });
  return sendMail({ ...template, to: user.email });
};

const sendDevolucion = (user, loan, item) => {
  const template = devolucionTemplate({
    nombreUsuario: user.nombre,
    itemNombre: item.nombre,
    cantidad: loan.cantidad_prestamo
  });
  return sendMail({ ...template, to: user.email });
};

const sendRecordatorio = (user, loan, item) => {
  const template = recordatorioTemplate({
    nombreUsuario: user.nombre,
    itemNombre: item.nombre,
    fechaEstimada: loan.fecha_estimada
  });
  return sendMail({ ...template, to: user.email });
};

const sendAplazado = (user, loan, item) => {
  const template = aplazadoTemplate({
    nombreUsuario: user.nombre,
    itemNombre: item.nombre,
    nuevaFecha: loan.fecha_estimada
  });
  return sendMail({ ...template, to: user.email });
};

module.exports = {
  sendMail,
  sendAprobacion,
  sendDevolucion,
  sendRecordatorio,
  sendAplazado
};