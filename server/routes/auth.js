import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// Generate token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Generate reset token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Job Ready AI Tool Genius!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #06b6d4;">Welcome to Job Ready AI Tool Genius!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for signing up for our service. We're excited to help you craft the perfect resume and cover letter!</p>
      <p>With your account, you can:</p>
      <ul>
        <li>Analyze and improve your resume</li>
        <li>Generate professional cover letters</li>
        <li>Track your application progress</li>
        <li>Get personalized job recommendations</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <br>
      <p>Best regards,<br>The Job Ready AI Team</p>
    </div>
  `;
  
  await sendEmail(user.email, subject, html);
};

// Send login notification email
const sendLoginEmail = async (user) => {
  const subject = 'New Login to Your Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #06b6d4;">New Login Detected</h2>
      <p>Hello ${user.name},</p>
      <p>We noticed a recent login to your Job Ready AI Tool Genius account.</p>
      <p><strong>Login details:</strong></p>
      <ul>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>Device: ${req.headers['user-agent'] || 'Unknown device'}</li>
      </ul>
      <p>If this was you, no action is needed. If you don't recognize this activity, please contact our support team immediately.</p>
      <br>
      <p>Stay secure,<br>The Job Ready AI Team</p>
    </div>
  `;
  
  await sendEmail(user.email, subject, html);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset?reset_id=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #06b6d4;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <br>
      <p>Best regards,<br>The Job Ready AI Team</p>
    </div>
  `;
  
  await sendEmail(user.email, subject, html);
};

// Signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);
    const { password: _, ...userData } = newUser.toObject();

    // Send welcome email (async - don't await to avoid blocking response)
    sendWelcomeEmail(userData).catch(console.error);

    res.status(201).json({ user: userData, token });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    const { password: _, ...userData } = user.toObject();

    // Send login notification email (async)
    sendLoginEmail(userData).catch(console.error);

    res.json({ user: userData, token });
  } catch (err) {
    next(err);
  }
});

// Forgot Password - Send reset link
// In your auth.js - add console logs for debugging
router.post('/forgot-password', async (req, res, next) => {
  try {
    console.log('Forgot password request:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'No user found');
    
    // Don't reveal if email exists or not for security
    if (!user) {
      console.log('User not found (but returning success for security)');
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token and set expiration (1 hour)
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log('Reset token generated for user:', user.email);

    // Send reset email (async)
    sendPasswordResetEmail(user, resetToken).catch(error => {
      console.error('Failed to send reset email:', error);
    });

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Error in forgot-password:', err);
    next(err);
  }
});

// Also check the reset-password endpoint
router.post('/reset-password', async (req, res, next) => {
  try {
    console.log('Reset password request:', req.body);
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      console.log('Missing token or newPassword');
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log('User found for reset:', user.email);

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log('Password reset successfully for:', user.email);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error in reset-password:', err);
    next(err);
  }
});

export default router;