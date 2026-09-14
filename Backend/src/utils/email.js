const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendResetEmail = async (email, resetUrl) => {
  if (!process.env.BREVO_API_KEY) {
    console.log("==========================================");
    console.log("BREVO_API_KEY missing. Reset link:");
    console.log(`To: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log("==========================================");
    return;
  }

  try {
    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Reset Your Password - Nexa",
      htmlContent: `
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
        </div>
      `,
      sender: {
        name: "Nexa Support",
        email: "anirbandutta458@gmail.com", // Your registered email address
      },
      to: [{ email: email }],
    });

    console.log("Brevo API Email delivered:", data);
  } catch (error) {
    console.error("Brevo API delivery error:", error);
  }
};

module.exports = { sendResetEmail };