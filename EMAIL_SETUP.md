# Email Setup Guide for ApnaDera

This guide will help you set up email functionality for the contact form in ApnaDera.

## 📧 Email Configuration

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click on "App passwords"
   - Generate a new app password for "Mail"
   - Copy the generated password

### 2. Update Environment Variables

Edit `server/config.env` and replace the placeholder values:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-app-password-from-step-1
```

### 3. Alternative Email Services

You can also use other email services by modifying the transporter configuration in `server/routes/contact.js`:

#### Outlook/Hotmail:

```javascript
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

#### Yahoo:

```javascript
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🔧 How It Works

### Contact Form Flow:

1. **User fills contact form** on property detail page
2. **Form submission** sends data to `/contact/send` endpoint
3. **Email sent to property owner/agent** with inquiry details
4. **Confirmation email sent** to the person who submitted the form
5. **Success message** displayed to user

### Email Templates:

- **Professional HTML emails** with ApnaDera branding
- **Property details** included in the email
- **Contact information** of the person making the inquiry
- **Confirmation emails** for both sender and recipient

## 🚀 Testing

1. **Start the server**: `npm run dev` (in server directory)
2. **Navigate to a property detail page**
3. **Fill out the contact form**
4. **Submit the form**
5. **Check your email** for the inquiry and confirmation

## 🔒 Security Notes

- **App passwords** are more secure than regular passwords
- **Environment variables** keep credentials secure
- **Rate limiting** prevents spam (configured in server)
- **Input validation** on both frontend and backend

## 📝 Troubleshooting

### Common Issues:

1. **"Authentication failed"**:

   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USER and EMAIL_PASS are set correctly

2. **"Service not found"**:

   - Check email service configuration
   - Verify email address format

3. **"Connection timeout"**:
   - Check internet connection
   - Verify firewall settings
   - Try different email service

### Debug Mode:

Add this to see detailed email logs:

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});
```

## ✅ Success Indicators

- ✅ Contact form submits without errors
- ✅ Property owner/agent receives inquiry email
- ✅ Person submitting form receives confirmation email
- ✅ Success toast message appears
- ✅ Form resets after successful submission

---

**Note**: Make sure to replace the placeholder values in `config.env` with your actual email credentials before testing!
