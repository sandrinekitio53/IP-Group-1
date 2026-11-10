const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

exports.sendVerificationEmail = (to, name, link) =>
  transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Confirm your TeamFlow email",
    text: `Hi ${name},\n\nConfirm your email to activate your account:\n${link}\n\nThis link expires in 24 hours. If you did not sign up, ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p><a href="${link}">Confirm your email</a> to activate your TeamFlow account.</p><p>This link expires in 24 hours. If you did not sign up, ignore this email.</p>`,
  });

exports.sendAlreadyRegisteredEmail = (to, name) =>
  transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Someone tried to sign up with your email",
    text: `Hi ${name},\n\nSomeone tried to create a TeamFlow account with this email, but you already have one. If it was you, just log in. If not, you can ignore this message.`,
  });