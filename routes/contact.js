const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});
router.post('/send', async (req, res) => {
  try {
    const { 
      propertyId, 
      propertyTitle, 
      contactName, 
      contactEmail, 
      contactPhone, 
      message,
      recipientEmail,
      recipientName,
      recipientType 
    } = req.body;
    if (!contactName || !contactEmail || !message || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Property Inquiry - ${propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ApnaDera - Property Inquiry</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">New Property Inquiry</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #3B82F6; margin-bottom: 15px;">Property Details</h3>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Property ID:</strong> ${propertyId}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #3B82F6; margin-bottom: 15px;">Contact Information</h3>
              <p><strong>Name:</strong> ${contactName}</p>
              <p><strong>Email:</strong> ${contactEmail}</p>
              ${contactPhone ? `<p><strong>Phone:</strong> ${contactPhone}</p>` : ''}
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #3B82F6; margin-bottom: 15px;">Message</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This inquiry was sent through ApnaDera platform</p>
            <p>© 2024 ApnaDera. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: contactEmail,
      subject: `Inquiry Sent - ${propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ApnaDera - Inquiry Confirmation</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Inquiry Has Been Sent</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #3B82F6; margin-bottom: 15px;">Property Details</h3>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Contact:</strong> ${recipientName} (${recipientType})</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #3B82F6; margin-bottom: 15px;">Your Message</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; color: #166534;"><strong>✓ Success!</strong> Your inquiry has been sent to ${recipientName}. They will get back to you soon.</p>
            </div>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>Thank you for using ApnaDera</p>
            <p>© 2024 ApnaDera. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(confirmationMailOptions);
    res.json({
      success: true,
      message: 'Inquiry sent successfully! You will receive a confirmation email shortly.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry. Please try again later.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = router; 