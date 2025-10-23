const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const classroomRoutes = require('./classroomRoutes');
const itemRoutes = require('./itemRoutes');
const loanRoutes = require('./loanRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoryRoutes);
router.use('/aulas', classroomRoutes);
router.use('/items', itemRoutes);
router.use('/prestamos', loanRoutes);

module.exports = router;