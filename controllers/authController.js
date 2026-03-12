const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');



const isAllowedSignupRole = (role) => role === 'user' || role === 'rider';

const buildAuthResponse = (user) => {
  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  };
};

const issueOtpForUser = async (user) => {
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '10', 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  user.emailOtpHash = otpHash;
  user.emailOtpExpiresAt = expiresAt;
  user.emailOtpRequestedAt = new Date();

  await user.save();

  console.log(`[TEST] OTP for ${user.email}: ${otp}`);
  try {
    await sendOtpEmail({ to: user.email, otp });
  } catch (err) {
    console.error(`[ERROR] Failed to send email: ${err.message}`);
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, and role are required.' });
    }

    if (!isAllowedSignupRole(role)) {
      return res.status(403).json({ message: 'Only user or rider can sign up.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isEmailVerified: false
    });

    await issueOtpForUser(user);

    return res.status(201).json({
      message: 'Signup successful. Please verify the OTP sent to your email.',
      email: user.email
    });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin login is not allowed here.' });
    }



    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify OTP.' });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

const requestEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    const cooldownSeconds = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
    if (user.emailOtpRequestedAt) {
      const nextAllowed = new Date(user.emailOtpRequestedAt.getTime() + cooldownSeconds * 1000);
      if (Date.now() < nextAllowed.getTime()) {
        return res.status(429).json({ message: 'Please wait before requesting another OTP.' });
      }
    }

    await issueOtpForUser(user);

    return res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'email and otp are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json(buildAuthResponse(user));
    }

    if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
      return res.status(400).json({ message: 'No OTP requested.' });
    }

    if (user.emailOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    const matches = await compareOtp(otp, user.emailOtpHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    user.emailOtpRequestedAt = undefined;

    await user.save();

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: 'OTP verification failed.', error: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({ message: 'Admin credentials are not configured.' });
    }

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken({ sub: 'admin', role: 'admin', email: adminEmail.toLowerCase() });
    return res.status(200).json({
      token,
      user: { id: 'admin', email: adminEmail.toLowerCase(), role: 'admin' }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Admin login failed.', error: error.message });
  }
};

module.exports = { signup, login, adminLogin, requestEmailOtp, verifyEmailOtp };
