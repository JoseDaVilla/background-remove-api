# 🚀 Render Deployment Guide

## Memory Optimization for 512MB Instance

This API is optimized to run on Render's free tier (512MB RAM).

## ⚙️ Render Configuration

### 1. Build Command
```bash
npm install
```

### 2. Start Command
```bash
npm start
```

### 3. Environment Variables
Set in Render Dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NODE_OPTIONS` | `--expose-gc --max-old-space-size=450` |

### 4. Instance Type
- **Free Tier**: 512MB RAM (works with optimizations)
- **Starter**: 512MB RAM
- **Recommended**: Upgrade to 1GB+ for better performance

## 🔧 Memory Optimizations Applied

1. **Request Queue**: Only 1 image processed at a time
2. **File Size Limit**: Reduced to 5MB (from 10MB)
3. **Garbage Collection**: Explicit GC after each request
4. **Memory Limit**: Set to 450MB (leaving 62MB buffer)
5. **Buffer Cleanup**: Immediate buffer nullification
6. **Queue Limit**: Max 3 pending requests (returns 503 if exceeded)

## 📊 Expected Performance

- **Memory Usage**: 250-480MB per request
- **Processing Time**: 10-30 seconds per image
- **Concurrent Requests**: 1 at a time (queued)
- **Max Queue**: 3 requests

## 🐛 Troubleshooting

### "Ran out of memory" Error

**Solution 1: Upgrade Instance**
- Go to Render Dashboard → Your Service → Instance Type
- Upgrade to 1GB or 2GB plan

**Solution 2: Reduce File Size Limit**
Edit `server.js`:
```javascript
const MAX_FILE_SIZE = 3 * 1024 * 1024; // Reduce to 3MB
```

**Solution 3: Add More Memory to Node**
In Render Dashboard, set:
```
NODE_OPTIONS=--expose-gc --max-old-space-size=480
```

### Slow Response Times

This is normal! Background removal is AI-heavy:
- Small images: 10-15 seconds
- Large images: 20-30 seconds
- Make sure your React Native app has proper timeout (60s)

### 503 "Server Busy" Errors

The queue is full (3+ requests pending). Options:
- Wait and retry
- Increase queue size in `server.js`
- Upgrade to handle concurrent requests

## 💰 Cost Optimization

### Free Tier Limits
- ✅ Works but slow (1 request at a time)
- ⚠️ May timeout on very large images
- ⚠️ Spins down after 15min inactivity

### Recommended Setup (Starter - $7/mo)
- Better reliability
- Still 512MB but no spin-down
- Faster cold starts

### Optimal Setup (Pro - $25/mo)
- 2GB RAM = process 2-3 images concurrently
- Much faster
- Better for production

## 🔄 Deployment Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Deploy to Render"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Create Web Service on Render**
- New → Web Service
- Connect your GitHub repo
- Set Build Command: `npm install`
- Set Start Command: `npm start`
- Add Environment Variables (see above)

3. **Deploy**
- Click "Create Web Service"
- Wait for deployment (2-5 minutes)
- Test with: `https://your-service.onrender.com/health`

## 🧪 Testing

```bash
# Health check
curl https://your-service.onrender.com/health

# Background removal
curl -X POST https://your-service.onrender.com/remove-bg \
  -F "image=@test.jpg" \
  -o result.png
```

## 📈 Monitoring

Watch your logs in Render Dashboard for:
- Memory usage warnings
- Processing times
- Queue lengths
- Error rates

If you see frequent OOM (Out of Memory) errors, upgrade your instance.

## ✅ Best Practices

1. **Client-side**: Compress images before upload
2. **Server-side**: Use the queue system (already implemented)
3. **Monitoring**: Check Render metrics regularly
4. **Scaling**: Upgrade when seeing frequent 503 errors
5. **Timeout**: Set client timeout to 60 seconds minimum

## 🎯 Production Checklist

- [ ] Environment variables set in Render
- [ ] Build & Start commands configured
- [ ] Health endpoint working
- [ ] Test with small image (< 1MB)
- [ ] Test with larger image (3-5MB)
- [ ] Monitor memory usage in dashboard
- [ ] Update React Native app with production URL
- [ ] Set proper timeout in client (60s)
- [ ] Add error handling for 503 responses

---

**Need help?** Check Render logs for detailed error messages.
