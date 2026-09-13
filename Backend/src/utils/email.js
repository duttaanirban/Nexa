const nodemailer = require("nodemailer");

// Create standard reusable SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  family: 4, // <-- FORCES NODEMAILER TO USE IPV4 ONLY (Fixes ENETUNREACH on Render)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetEmail = async (email, resetUrl) => {
  // Log to console in local mode if SMTP credentials are missing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("==========================================");
    console.log("SMTP credentials missing. Logging reset link:");
    console.log(`To: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log("==========================================");
    return;
  }

  const mailOptions = {
    from: `"Nexa Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - Nexa",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
        <h2 style="color: #6366f1; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.5;">
          You requested a password reset for your Nexa account. Click the button below to set a new password:
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 24px;" />
        <p style="color: #475569; font-size: 12px;">Nexa Task & Project Management</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };