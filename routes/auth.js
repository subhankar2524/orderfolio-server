const express = require('express');
const {
  signup,
  login,
  adminLogin,
  requestEmailOtp,
  verifyEmailOtp
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/request-otp', requestEmailOtp);
router.post('/verify-otp', verifyEmailOtp);

module.exports = router;
