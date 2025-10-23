const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const authJWT = require('../middlewares/authJWT');
const roleGuard = require('../middlewares/roleGuard');
const validate = require('../middlewares/validate');
const { categoryBody } = require('../validators/categoryValidator');

const router = express.Router();

router.use(authJWT, roleGuard(['Admin']));

router.get('/', getCategories);
router.post('/', categoryBody, validate, createCategory);
router.put('/:id', categoryBody, validate, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;