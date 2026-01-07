import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVendorRegistrationEmail = async (vendorEmail, vendorName) => {
  const subject = 'Registration Received - Medical Marketplace';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Medical Marketplace!</h2>
      <p>Dear ${vendorName},</p>
      <p>Thank you for registering with Medical Marketplace. Your application has been received and is currently under review.</p>
      <p>Our team will verify your documents and credentials. This process typically takes 24-48 hours.</p>
      <p>You will receive another email once your account has been approved.</p>
      <p>If you have any questions, please contact our support team.</p>
      <br>
      <p>Best regards,<br>Medical Marketplace Team</p>
    </div>
  `;

  return sendEmail(vendorEmail, subject, html);
};

export const sendVendorApprovalEmail = async (vendorEmail, vendorName) => {
  const subject = 'Account Approved - Medical Marketplace';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations!</h2>
      <p>Dear ${vendorName},</p>
      <p>We are pleased to inform you that your vendor account has been approved.</p>
      <p>You can now log in to your dashboard and start using our marketplace.</p>
      <p><a href="${process.env.CLIENT_URL}/login" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Login to Dashboard</a></p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
      <br>
      <p>Best regards,<br>Medical Marketplace Team</p>
    </div>
  `;

  return sendEmail(vendorEmail, subject, html);
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request - Medical Marketplace';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Medical Marketplace Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};