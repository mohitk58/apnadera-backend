# Railway Environment Variables Setup

## 🚨 Current Issue

Your Railway deployment is crashing because the required environment variables are not set.

## 🔧 Fix Steps

### Step 1: Go to Railway Dashboard

1. Visit [Railway Dashboard](https://railway.app/dashboard)
2. Click on your backend service (apnadera-backend)

### Step 2: Add Environment Variables

1. Click on the **"Variables"** tab
2. Click **"New Variable"** for each of these:

#### Required Variables:

**Variable Name:** `NODE_ENV`
**Value:** `production`

**Variable Name:** `MONGODB_URI`
**Value:** `mongodb+srv://mohitkumar:1WV0g2CIRzWI8U8X@cluster1.0ih7ekv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`

**Variable Name:** `JWT_SECRET`
**Value:** `house-price-properties-jwt-secret-key-2024-change-in-production`

#### Optional Variables (if you want email functionality):

**Variable Name:** `EMAIL_USER`
**Value:** `mk581991@gmail.com`

**Variable Name:** `EMAIL_PASS`
**Value:** `etso zmha jrgq awbu`

### Step 3: Deploy

1. After adding all variables, Railway will automatically redeploy
2. Wait for the deployment to complete
3. Check the logs to ensure no errors

### Step 4: Test

1. Visit your Railway app URL
2. Add `/health` to the URL to test the health endpoint
3. You should see a JSON response with system status

## ✅ Expected Result

After setting these variables, your app should start successfully and the 500 errors should be resolved.

## 🔍 Troubleshooting

If you still see errors:

1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure there are no extra spaces in the variable values
