const express = require('express');
const { register, login, me } = require('../controllers/authController');
const authJWT = require('../middlewares/authJWT');
const validate = require('../middlewares/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authJWT, me);

module.exports = router;