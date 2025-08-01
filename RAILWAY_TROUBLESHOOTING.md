# Railway JWT_SECRET Troubleshooting

## 🚨 Current Issue

Your Railway deployment is still missing the `JWT_SECRET` environment variable.

## ✅ Good News

- `MONGODB_URI` is now working (not in error list)
- Only `JWT_SECRET` is missing

## 🔧 Step-by-Step Fix

### Step 1: Double-Check Railway Variables

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your backend service
3. Go to **"Variables"** tab
4. Look for `JWT_SECRET` in the list

### Step 2: Add JWT_SECRET (if missing)

If you don't see `JWT_SECRET` in the variables list:

1. Click **"New Variable"**
2. **Variable Name:** `JWT_SECRET`
3. **Value:** `house-price-properties-jwt-secret-key-2024-change-in-production`
4. Click **"Add"**

### Step 3: Verify Variable Format

Make sure:

- No extra spaces before or after the value
- The variable name is exactly `JWT_SECRET` (case sensitive)
- The value is exactly: `house-price-properties-jwt-secret-key-2024-change-in-production`

### Step 4: Check Deployment

1. After adding the variable, Railway should auto-redeploy
2. Wait 1-2 minutes for deployment to complete
3. Check the logs again

## 🔍 Alternative Solutions

### Option 1: Use Railway CLI

If the web interface isn't working, try Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Set the variable
railway variables set JWT_SECRET=house-price-properties-jwt-secret-key-2024-change-in-production
```

### Option 2: Check Variable Scope

Make sure the variable is set for the correct service:

1. In Railway dashboard, verify you're editing the **backend service**
2. Not the frontend or any other service

### Option 3: Manual Redeploy

1. After setting the variable, manually trigger a redeploy
2. Go to "Deployments" tab
3. Click "Deploy" button

## ✅ Expected Result

After adding `JWT_SECRET`, you should see:

```
✅ Connected to MongoDB successfully
🚀 Server running on port 5002
```

## 🆘 Still Having Issues?

If the variable is set but still not working:

1. Try deleting and re-adding the variable
2. Check if there are any special characters in the value
3. Try a simpler JWT_SECRET value like: `my-secret-key-2024`
