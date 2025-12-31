const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

async function sendEmail(to, subject, text) {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
