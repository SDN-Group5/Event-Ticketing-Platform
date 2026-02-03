import * as nodemailer from "nodemailer";

/**
 * Email Service - Gửi email OTP verification
 * 
 * Setup Gmail SMTP:
 * 1. Vào Google Account → Security
 * 2. Bật "2-Step Verification"
 * 3. Tạo "App Password" (16 ký tự)
 * 4. Dùng App Password làm EMAIL_PASSWORD trong .env
 */

interface SendVerificationEmailParams {
  to: string;
  firstName: string;
  code: string;
}

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log("⚠️  EMAIL_USER or EMAIL_PASSWORD not found in .env");
    return null;
  }

  try {
    console.log(`📧 Creating email transporter with EMAIL_USER: ${process.env.EMAIL_USER}`);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email transporter verification failed:", error);
      } else {
        console.log("✅ Email transporter is ready to send emails");
      }
    });

    return transporter;
  } catch (error) {
    console.error("❌ Error creating email transporter:", error);
    return null;
  }
};

export const sendVerificationEmail = async ({
  to,
  firstName,
  code,
}: SendVerificationEmailParams): Promise<boolean> => {
  try {
    console.log(`📧 Attempting to send verification email to: ${to}`);
    
    const transporter = createTransporter();

    if (!transporter) {
      const errorMsg = "Email service not configured. EMAIL_USER and EMAIL_PASSWORD are required in .env";
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const mailOptions = {
      from: `"TicketVibe" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Email - TicketVibe",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #8655f6;
                margin-bottom: 10px;
              }
              .code-box {
                background: linear-gradient(135deg, #8655f6 0%, #d946ef 100%);
                color: white;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                padding: 20px;
                border-radius: 10px;
                letter-spacing: 8px;
                margin: 30px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #999;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎫 TicketVibe</div>
                <h1 style="color: #333; margin: 0;">Verify Your Email</h1>
              </div>
              
              <p>Hi <strong>${firstName}</strong>,</p>
              
              <p>Thank you for signing up for TicketVibe! To complete your registration, please verify your email address by entering the code below:</p>
              
              <div class="code-box">
                ${code}
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This code will expire in <strong>1 minute</strong>. If you didn't create an account, please ignore this email.
              </p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} TicketVibe. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Hi ${firstName},
        
        Thank you for signing up for TicketVibe!
        
        Your verification code is: ${code}
        
        This code will expire in 1 minute.
        
        If you didn't create an account, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

interface SendResetPasswordEmailParams {
  to: string;
  firstName: string;
  code: string;
}

export const sendResetPasswordEmail = async ({
  to,
  firstName,
  code,
}: SendResetPasswordEmailParams): Promise<boolean> => {
  try {
    console.log(`📧 Attempting to send reset password email to: ${to}`);
    
    const transporter = createTransporter();

    if (!transporter) {
      const errorMsg = "Email service not configured. EMAIL_USER and EMAIL_PASSWORD are required in .env";
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const mailOptions = {
      from: `"TicketVibe" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password - TicketVibe",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #8655f6;
                margin-bottom: 10px;
              }
              .code-box {
                background: linear-gradient(135deg, #8655f6 0%, #d946ef 100%);
                color: white;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                padding: 20px;
                border-radius: 10px;
                letter-spacing: 8px;
                margin: 30px 0;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #999;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎫 TicketVibe</div>
                <h1 style="color: #333; margin: 0;">Reset Your Password</h1>
              </div>
              
              <p>Hi <strong>${firstName}</strong>,</p>
              
              <p>We received a request to reset your password. Use the code below to reset your password:</p>
              
              <div class="code-box">
                ${code}
              </div>
              
              <div class="warning">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Security Notice:</strong> This code will expire in <strong>1 minute</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Enter this code on the reset password page to create a new password.
              </p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} TicketVibe. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Hi ${firstName},
        
        We received a request to reset your password.
        
        Your reset code is: ${code}
        
        This code will expire in 1 minute.
        
        If you didn't request a password reset, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password email sent to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error sending reset password email:", error);
    throw error;
  }
};
