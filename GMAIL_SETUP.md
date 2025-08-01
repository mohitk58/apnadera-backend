# Gmail Setup for ApnaDera Email Functionality

## 🔧 Fix for "Failed to send inquiry" Error

The 500 error you're getting is because Gmail requires an **App Password** instead of your regular password for security reasons.

## 📋 Step-by-Step Fix:

### 1. Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click on **2-Step Verification**
4. Follow the steps to enable 2FA on your account

### 2. Generate App Password

1. Go back to **Security** settings
2. Under "2-Step Verification", click on **App passwords**
3. Select **Mail** from the dropdown
4. Click **Generate**
5. Copy the 16-character password that appears

### 3. Update Your Config

Edit `server/config.env` and replace the EMAIL_PASS:

```env
EMAIL_USER=mk581991@gmail.com
EMAIL_PASS=your-16-character-app-password-here
```

**Important**: The app password will look something like: `abcd efgh ijkl mnop`

### 4. Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Alternative: Use Less Secure Apps (Not Recommended)

If you can't enable 2FA, you can temporarily use this configuration:

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
```

**Warning**: This is less secure and Google may block it.

## 🧪 Test the Fix

1. **Update the config.env** with your app password
2. **Restart the server**
3. **Try submitting a contact form**
4. **Check the server console** for detailed error logs

## 📝 Common Error Messages & Solutions:

### "Invalid login"

- ❌ Using regular password instead of app password
- ✅ Generate and use app password

### "Username and Password not accepted"

- ❌ 2FA not enabled
- ✅ Enable 2FA first, then generate app password

### "Connection timeout"

- ❌ Network/firewall issue
- ✅ Check internet connection

### "Service not found"

- ❌ Wrong service name
- ✅ Use 'gmail' (lowercase)

## 🔧 Debug Mode

The current configuration has debug mode enabled. Check your server console for detailed logs like:

```
[connection] Connected to smtp.gmail.com:587
[auth] Authenticated as mk581991@gmail.com
[message] Sending message...
```

## ✅ Success Indicators

- ✅ No error messages in server console
- ✅ "Message sent" logs appear
- ✅ Contact form submits successfully
- ✅ You receive the inquiry email
- ✅ Sender receives confirmation email

## 🚨 Security Note

- **Never commit** your app password to git
- **Use environment variables** (which you're already doing)
- **App passwords are more secure** than regular passwords
- **Each app should have its own** app password

---

**After following these steps, your email functionality should work perfectly!** 🎉
