const nodemailer = require("nodemailer");

const sendResetEmail = async (email, resetUrl) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("==========================================");
    console.log(`PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetUrl);
    console.log("==========================================");
    return;
  }

  // Uncomment when SMTP credentials are added to .env
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Nexa Support" <noreply@nexa.com>',
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`,
  });
  */
};

module.exports = { sendResetEmail };