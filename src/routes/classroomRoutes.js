const express = require('express');
const {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom
} = require('../controllers/classroomController');
const authJWT = require('../middlewares/authJWT');
const roleGuard = require('../middlewares/roleGuard');
const validate = require('../middlewares/validate');
const { classroomBody } = require('../validators/classroomValidator');

const router = express.Router();

router.use(authJWT, roleGuard(['Admin']));

router.get('/', getClassrooms);
router.post('/', classroomBody, validate, createClassroom);
router.put('/:id', classroomBody, validate, updateClassroom);
router.delete('/:id', deleteClassroom);

module.exports = router;