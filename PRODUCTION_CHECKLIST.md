# Production Deployment Checklist

## Environment Variables (Required)

Make sure these environment variables are set in your production environment (Railway/Heroku/etc.):

### Required Variables

- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database`
- `JWT_SECRET=your-secure-jwt-secret-key-here`

### Optional Variables

- `PORT=5002` (or let the platform set it)
- `EMAIL_USER=your-email@gmail.com`
- `EMAIL_PASS=your-app-password`

## Railway Deployment Steps

1. **Set Environment Variables:**

   - Go to your Railway dashboard
   - Click on your backend service
   - Go to "Variables" tab
   - Add all required environment variables

2. **Deploy the Updated Code:**

   - The improved error handling is now in place
   - Better CORS configuration for production domains
   - Enhanced MongoDB connection with proper error handling

3. **Test the Health Endpoint:**
   - Visit: `https://your-railway-app.railway.app/health`
   - Should return detailed health information

## Testing Steps

1. **Check Health Endpoint:**

   ```bash
   curl https://your-railway-app.railway.app/health
   ```

2. **Test Database Connection:**

   - The health endpoint will show database status
   - Look for "database": "connected" in the response

3. **Test CORS:**
   - Try accessing from your frontend domain
   - Check browser console for CORS errors

## Common Issues & Solutions

### Issue: JWT_SECRET not set

**Solution:** Add JWT_SECRET environment variable with a secure random string

### Issue: MongoDB connection fails

**Solution:**

- Verify MONGODB_URI is correct
- Check if IP is whitelisted in MongoDB Atlas
- Ensure user has proper permissions

### Issue: CORS errors

**Solution:**

- Check if your frontend domain is in the allowed origins
- Update the CORS configuration if needed

### Issue: Rate limiting blocking requests

**Solution:**

- The rate limiter is configured for 100 requests per 15 minutes
- Adjust if needed for your use case

## Monitoring

1. **Check Railway Logs:**

   - Go to your Railway dashboard
   - Click on your service
   - Check the "Logs" tab for any errors

2. **Use the Health Endpoint:**

   - Monitor `/health` endpoint for system status
   - Check database connection status
   - Monitor memory usage

3. **Error Logging:**
   - All errors are now logged with detailed information
   - Check logs for specific error messages
