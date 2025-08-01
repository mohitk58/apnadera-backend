# 🔧 Gmail Authentication Fix Guide

## 🚨 Current Issue

You're getting "Username and Password not accepted" error because Gmail requires an **App Password** instead of your regular password.

## 📋 Step-by-Step Solution

### Option 1: Use App Password (Recommended)

#### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA

#### Step 2: Generate App Password

1. Go back to **Security** settings
2. Under "2-Step Verification", click **App passwords**
3. Select **Mail** from the dropdown
4. Click **Generate**
5. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

#### Step 3: Update Config

Edit `server/config.env`:

```env
EMAIL_USER=mk581991@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Option 2: Use Less Secure Apps (Temporary Fix)

If you can't enable 2FA right now:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security**
3. Scroll down to **Less secure app access**
4. Turn it **ON**

**Warning**: This is less secure and Google may disable it.

### Option 3: Use Different Email Service

You can also use Outlook, Yahoo, or other email services:

#### For Outlook:

```javascript
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: "your-email@outlook.com",
    pass: "your-password",
  },
});
```

#### For Yahoo:

```javascript
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: "your-email@yahoo.com",
    pass: "your-password",
  },
});
```

## 🧪 Testing Your Configuration

### Test 1: Check Email Configuration

Visit: `http://localhost:5002/contact/test`

This will tell you if your email configuration is working.

### Test 2: Check Server Logs

Look at your server console for detailed logs like:

```
[connection] Connected to smtp.gmail.com:587
[auth] Authenticated as mk581991@gmail.com
```

### Test 3: Try Contact Form

1. Go to any property detail page
2. Fill out the contact form
3. Submit and check for success

## 🔍 Debug Steps

### 1. Check Your Current Password

Make sure you're not using:

- ❌ Your regular Gmail password
- ❌ A password with special characters that might be encoded wrong

### 2. Verify Environment Variables

Check `server/config.env`:

```env
EMAIL_USER=mk581991@gmail.com
EMAIL_PASS=your-actual-password-or-app-password
```

### 3. Restart Server

After changing config:

```bash
# Stop server (Ctrl+C)
npm run dev
```

## 📝 Common Issues & Solutions

### "Invalid login"

- **Problem**: Using regular password
- **Solution**: Generate app password

### "Username and Password not accepted"

- **Problem**: 2FA not enabled or wrong password
- **Solution**: Enable 2FA and use app password

### "Connection timeout"

- **Problem**: Network/firewall issue
- **Solution**: Check internet connection

### "Service not found"

- **Problem**: Wrong service configuration
- **Solution**: Use correct service name

## 🚀 Quick Test

1. **Update your config.env** with app password
2. **Restart server**: `npm run dev`
3. **Test endpoint**: Visit `http://localhost:5002/contact/test`
4. **Try contact form** on any property page

## ✅ Success Indicators

- ✅ `/contact/test` returns success
- ✅ No error messages in server console
- ✅ Contact form submits successfully
- ✅ You receive inquiry emails
- ✅ Sender receives confirmation emails

---

**Follow these steps and your email functionality will work!** 🎉
