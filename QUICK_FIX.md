# Quick Fix: Add JWT_SECRET to Railway

## 🚨 Problem

Your Railway deployment is missing the `JWT_SECRET` environment variable.

## ⚡ Quick Solution

### Step 1: Go to Railway Dashboard

1. Visit: https://railway.app/dashboard
2. Click on your **backend service** (apnadera-backend)

### Step 2: Add JWT_SECRET Variable

1. Click **"Variables"** tab
2. Click **"New Variable"**
3. Fill in:
   - **Name:** `JWT_SECRET`
   - **Value:** `house-price-properties-jwt-secret-key-2024-change-in-production`
4. Click **"Add"**

### Step 3: Wait for Redeploy

- Railway will automatically redeploy
- Wait 1-2 minutes
- Check logs for success message

## ✅ Expected Success Message

After adding JWT_SECRET, you should see:

```
✅ Connected to MongoDB successfully
🚀 Server running on port 5002
```

## 🔍 If Still Not Working

### Option 1: Try Simpler Secret

If the long secret doesn't work, try a shorter one:

- **Name:** `JWT_SECRET`
- **Value:** `my-secret-key-2024`

### Option 2: Check Variable Name

Make sure the variable name is exactly `JWT_SECRET` (case sensitive)

### Option 3: Manual Redeploy

1. After adding variable, go to "Deployments" tab
2. Click "Deploy" button

## 🎯 This Will Fix

- ✅ 500 Internal Server Errors
- ✅ User authentication (login/register)
- ✅ JWT token generation
- ✅ All API endpoints

The JWT_SECRET is required for user authentication. Without it, all auth-related endpoints return 500 errors.
