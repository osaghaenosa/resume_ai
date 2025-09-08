// utils/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (toEmail, name) => {
  try {
    await transporter.sendMail({
      from: `"JOB READY AI TOOL" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "🎉 Welcome to JOB READY AI TOOL",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Welcome Email</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
        <table width="100%" bgcolor="#f4f6f8" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <!-- Main container -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                
                <!-- Header with logo -->
                <tr>
                  <td bgcolor="#0D47A1" align="center" style="padding:20px;">
                    <img src="https://yourcdn.com/logo.png" alt="JOB READY AI TOOL" width="120" style="display:block;"/>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:30px;">
                    <h2 style="color:#0D47A1; margin:0 0 15px 0;">Hello ${name},</h2>
                    <p style="font-size:16px; color:#333333; line-height:1.6; margin:0 0 20px 0;">
                      Welcome to <strong>JOB READY AI TOOL</strong> 🎉<br/>
                      We’re thrilled to have you onboard. You now have access to powerful tools that will help you become more job-ready and boost your career.
                    </p>

                    <!-- Button -->
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto;">
                      <tr>
                        <td align="center" bgcolor="#0D47A1" style="border-radius:8px;">
                          <a href="https://jobreadytool.com/tutorial" target="_blank" 
                             style="display:inline-block; padding:14px 28px; font-size:16px; color:#ffffff; text-decoration:none; font-weight:bold; border-radius:8px; font-family:Arial, sans-serif;">
                            🚀 Start Your Tutorial
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:14px; color:#666666; line-height:1.6; margin:0;">
                      Need help? Visit our 
                      <a href="https://jobreadytool.com/support" style="color:#0D47A1; text-decoration:none;">Support Center</a> 
                      or reply to this email. We’re always here to assist you.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td bgcolor="#f0f2f5" align="center" style="padding:20px; font-size:12px; color:#777777;">
                    © ${new Date().getFullYear()} JOB READY AI TOOL. All rights reserved.
                  </td>
                </tr>
              </table>
              <!-- End main container -->
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });
    console.log(`✅ Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};