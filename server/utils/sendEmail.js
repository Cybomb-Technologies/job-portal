const nodemailer = require('nodemailer');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('WARNING: Email configuration missing in .env (SMTP_HOST, SMTP_USER, SMTP_PASS). Email sending will fail.');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (options) => {
  const message = {
    from: `${process.env.SMTP_USER}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Ensure HTML is passed
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
