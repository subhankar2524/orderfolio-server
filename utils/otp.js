const bcrypt = require('bcryptjs');

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

const compareOtp = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

module.exports = { generateOtp, hashOtp, compareOtp };
